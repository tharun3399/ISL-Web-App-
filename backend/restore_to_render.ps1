# PowerShell helper to restore a plain SQL dump to a remote Postgres (Render)
# Requires psql to be installed and available in PATH. Install from: https://www.postgresql.org/download/windows/
# Usage: .\restore_to_render.ps1 -SqlFile .\backup_v2.sql -DbUrl "postgresql://user:pass@host:5432/dbname"
param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile,
    [Parameter(Mandatory=$true)]
    [string]$DbUrl
)

if (-not (Test-Path $SqlFile)) {
    Write-Error "SQL file not found: $SqlFile"
    exit 1
}

# Parse connection URL into components for psql (psql accepts the URL directly via --dbname)
# For convenience, we will call psql using the provided URL.

Write-Host "Starting restore of $SqlFile to $DbUrl"

# Recommend prompting for confirmation
$confirm = Read-Host "This will execute the SQL file against the target DB. Are you sure? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "Aborted by user"
    exit 0
}

# Run psql
$psqlCmd = "psql --single-transaction --set ON_ERROR_STOP=on \"$DbUrl\" -f \"$SqlFile\""
Write-Host "Running: $psqlCmd"

# Use Start-Process to inherit console and show output
$proc = Start-Process -FilePath psql -ArgumentList "--single-transaction","--set","ON_ERROR_STOP=on",$DbUrl,"-f",$SqlFile -NoNewWindow -Wait -PassThru
if ($proc.ExitCode -ne 0) {
    Write-Error "psql exited with code $($proc.ExitCode)"
    exit $proc.ExitCode
}

Write-Host "Restore completed successfully"

# Post-restore checks (manual)
Write-Host "After restore, check tables:\n 1) Connect via psql or pgAdmin and run: \n    SELECT tablename FROM pg_tables WHERE schemaname='public';\n 2) Run your backend /db-check and /health endpoints to verify connectivity."
