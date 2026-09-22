#!/usr/bin/env python3
"""
push_to_remote.py

Reads a local pg dump (backup_final.sql by default) and streams COPY ... FROM stdin blocks into the remote database.
- It will skip CREATE TABLE/ALTER statements and only execute COPY blocks (inserts data).
- It reads DATABASE_URL from backend/.env by default. You may set REMOTE_DATABASE_URL env var to override.

Usage:
  python scripts/push_to_remote.py --file ../backup_final.sql

WARNING: This appends data to existing tables. It does not DROP tables. Use with care.
"""
import os
import re
import io
import argparse
import pathlib
import sys
import psycopg2
from psycopg2 import sql


def load_env(env_path: str):
    env = {}
    p = pathlib.Path(env_path)
    if not p.exists():
        return env
    for line in p.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


def parse_and_send_copy_blocks(dump_path: str, conn):
    copy_re = re.compile(r"^COPY\s+([^\s(]+)\s*\(([^)]+)\)\s+FROM\s+stdin;", re.IGNORECASE)
    cur = conn.cursor()
    # Ensure DDL (CREATE TABLE, SEQUENCE, INDEX, ALTER) before copy blocks are applied.
    # Read file until first COPY and execute collected DDL statements.
    apply_ddl_before_copy(dump_path, conn)

    with open(dump_path, 'r', encoding='utf-8', errors='replace') as f:
        in_copy = False
        target_table = None
        target_cols = None
        buffer_lines = []
        lineno = 0
        for raw_line in f:
            lineno += 1
            line = raw_line.rstrip('\n')
            if not in_copy:
                m = copy_re.match(line)
                if m:
                    target_table = m.group(1)
                    target_cols = m.group(2)
                    in_copy = True
                    buffer_lines = []
                    print(f"Found COPY for {target_table} ({target_cols}) at line {lineno}")
                # else skip other statements
            else:
                if line == '\\.' or line == '.':
                    # end of copy block
                    data = '\n'.join(buffer_lines) + '\n'
                    # If there are no data rows, skip COPY to avoid errors from empty lines
                    if len(buffer_lines) == 0:
                        print(f"  => Skipping COPY for {target_table}: 0 rows present")
                    else:
                        # Use copy_expert to stream data
                        try:
                            copy_sql = f"COPY {target_table} ({target_cols}) FROM STDIN;"
                            print(f"Streaming {len(buffer_lines)} rows into {target_table} ...")
                            cur.copy_expert(copy_sql, io.StringIO(data))
                            conn.commit()
                            print(f"  => Done: inserted rows into {target_table}")
                        except Exception as e:
                            conn.rollback()
                            print(f"ERROR copying into {target_table}: {e}")
                            # continue with next tables rather than aborting whole run
                            continue
                    in_copy = False
                    target_table = None
                    target_cols = None
                    buffer_lines = []
                else:
                    buffer_lines.append(line)
    cur.close()


def apply_ddl_before_copy(dump_path: str, conn):
    """Execute DDL statements found before the first COPY block in the dump.
    This will create missing tables/sequences/indexes so COPY can succeed.
    """
    copy_re = re.compile(r"^COPY\s+([^\s(]+)\s*\(([^)]+)\)\s+FROM\s+stdin;", re.IGNORECASE)
    ddl_lines = []
    with open(dump_path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            if copy_re.match(line):
                break
            # Skip DROP TABLE statements to avoid accidental data loss.
            if line.strip().upper().startswith('DROP TABLE'):
                continue
            ddl_lines.append(line)

    # We'll execute statements by accumulating lines until we hit a semicolon.
    cur = conn.cursor()
    stmt_buf = []
    executed = 0
    for line in ddl_lines:
        s = line.rstrip('\n')
        # Skip pg_dump comments and meta lines
        if s.strip().startswith('--') or s.strip().startswith('\\'):
            continue
        # Skip empty lines
        if not s.strip():
            continue
        stmt_buf.append(s)
        if s.strip().endswith(';'):
            stmt = '\n'.join(stmt_buf).strip()
            stmt_buf = []
            # Skip session-setting statements
            up = stmt.upper()
            if up.startswith('SET ') or 'PG_CATALOG.SET_CONFIG' in up:
                continue
            try:
                cur.execute(stmt)
                conn.commit()
                executed += 1
            except Exception as e:
                conn.rollback()
                print(f"Warning: failed to execute DDL statement (continuing): {e}\nStatement start: {stmt[:200]}")

    # If any leftover buffer, try to execute it
    if stmt_buf:
        stmt = '\n'.join(stmt_buf).strip()
        if stmt:
            try:
                cur.execute(stmt)
                conn.commit()
                executed += 1
            except Exception as e:
                conn.rollback()
                print(f"Warning: failed to execute trailing DDL statement: {e}\nStatement start: {stmt[:200]}")

    print(f"Applied roughly {executed} DDL statements before COPY (warnings may have occurred).")
    cur.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--file', '-f', default='../backup_final.sql', help='Path to SQL dump (relative to scripts/ or absolute)')
    parser.add_argument('--env', default='../.env', help='Path to .env file containing DATABASE_URL')
    parser.add_argument('--dry-run', action='store_true', help='Parse only without sending')
    args = parser.parse_args()

    dump_path = pathlib.Path(args.file).resolve()
    if not dump_path.exists():
        print('Dump file not found:', dump_path)
        sys.exit(1)

    env = load_env(pathlib.Path(args.env).resolve())
    db_url = os.environ.get('REMOTE_DATABASE_URL') or env.get('DATABASE_URL') or os.environ.get('DATABASE_URL')
    if not db_url:
        print('DATABASE_URL not found in .env or environment (set REMOTE_DATABASE_URL to override).')
        sys.exit(1)

    print('Using database URL from env (.env or REMOTE_DATABASE_URL).')
    print('Dump file:', dump_path)

    if args.dry_run:
        # Just parse and report COPY blocks
        copy_re = re.compile(r"^COPY\s+([^\s(]+)\s*\(([^)]+)\)\s+FROM\s+stdin;", re.IGNORECASE)
        with open(dump_path, 'r', encoding='utf-8', errors='replace') as f:
            for i, line in enumerate(f, 1):
                if copy_re.match(line):
                    m = copy_re.match(line)
                    print(f"Found COPY for {m.group(1)} cols: {m.group(2)} at line {i}")
        print('Dry run complete.')
        return

    # Connect with sslmode=require by default
    print('Connecting to remote DB...')
    try:
        conn = psycopg2.connect(db_url, sslmode='require')
    except Exception as e:
        print('Failed to connect using sslmode=require:', e)
        print('Trying without sslmode (not recommended)...')
        try:
            conn = psycopg2.connect(db_url)
        except Exception as e2:
            print('Connection failed:', e2)
            sys.exit(1)

    try:
        parse_and_send_copy_blocks(str(dump_path), conn)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
