# Restore a plain SQL dump to a remote Postgres database such as Render.
# Usage: .\restore_to_render.ps1 -SqlFile .\backup_clean.sql -DbUrl $env:RENDER_DATABASE_URL
param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile,
    [Parameter(Mandatory=$true)]
    [string]$DbUrl
)

if (-not (Test-Path -LiteralPath $SqlFile)) {
    Write-Error "SQL file not found: $SqlFile"
    exit 1
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Error "psql was not found in PATH. Install the PostgreSQL client and try again."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($DbUrl)) {
    Write-Error "A Render External Database URL is required."
    exit 1
}

Write-Host "Starting restore of $SqlFile"
$confirm = Read-Host "This will execute the SQL file against the target database. Are you sure? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "Aborted by user"
    exit 0
}

# The supplied dump is UTF-16LE. Convert it to UTF-8 so psql does not read NUL bytes.
# Render's managed role cannot assume the source dump's postgres role, so omit
# source ownership/session-role statements while retaining schema and data.
$tempSqlFile = $null
try {
    $resolvedSqlFile = (Resolve-Path -LiteralPath $SqlFile).Path
    $bytes = [System.IO.File]::ReadAllBytes($resolvedSqlFile)
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
        $tempSqlFile = Join-Path ([System.IO.Path]::GetTempPath()) ("isl-restore-" + [guid]::NewGuid().ToString() + ".sql")
        $content = [System.Text.Encoding]::Unicode.GetString($bytes, 2, $bytes.Length - 2)
        $content = (($content -split "\r?\n") | Where-Object {
            $line = $_.Trim()
            $line -notmatch '^SET\s+(ROLE|SESSION AUTHORIZATION)\b' -and
            $line -notmatch '^ALTER\s+.*\sOWNER\s+TO\s+' -and
            $line -notmatch '^GRANT\s+' -and
            $line -notmatch '^REVOKE\s+'
        }) -join [Environment]::NewLine
        [System.IO.File]::WriteAllText($tempSqlFile, $content, (New-Object System.Text.UTF8Encoding($false)))
        $restoreFile = $tempSqlFile
    } else {
        $restoreFile = $resolvedSqlFile
    }

    $proc = Start-Process -FilePath $psql.Source `
        -ArgumentList "--single-transaction","--set","ON_ERROR_STOP=on",$DbUrl,"-f",$restoreFile `
        -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0) {
        throw "psql exited with code $($proc.ExitCode)"
    }
} catch {
    Write-Error "Restore failed: $($_.Exception.Message)"
    exit 1
} finally {
    if ($tempSqlFile -and (Test-Path -LiteralPath $tempSqlFile)) {
        Remove-Item -LiteralPath $tempSqlFile -Force
    }
}

Write-Host "Restore completed successfully"
Write-Host "Verify with: psql `"<Render URL>`" -c `"SELECT COUNT(*) FROM users;`""
