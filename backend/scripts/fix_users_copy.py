#!/usr/bin/env python3
"""
fix_users_copy.py

Extracts the COPY block for public.users from a dump and sanitizes empty id values to NULL (\\N),
then streams the block to the remote DB. Use when a COPY fails due to empty strings for integer columns.
"""
import os
import re
import io
import pathlib
import sys
import argparse
import psycopg2


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


def extract_users_copy(dump_path: str, table_name='public.users'):
    copy_re = re.compile(r"COPY\s+([^\s(]+)\s*\(([^)]+)\)\s+FROM\s+stdin;", re.IGNORECASE)
    in_copy = False
    buffer_lines = []
    with open(dump_path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            if not in_copy:
                m = copy_re.match(line)
                if m and m.group(1).lower() == table_name.lower():
                    in_copy = True
                    cols = m.group(2)
                    continue
            else:
                if line.rstrip('\n') in ('\\.', '.'):
                    break
                buffer_lines.append(line.rstrip('\n'))
    return cols, buffer_lines


def sanitize_lines(lines):
    out = []
    for ln in lines:
        # assume tab-separated fields
        fields = ln.split('\t')
        if len(fields) > 0 and fields[0] == '':
            fields[0] = '\\N'
        out.append('\t'.join(fields))
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--file', '-f', default='../backup_final.sql')
    parser.add_argument('--env', default='../.env')
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

    print('Using DB URL from env. Extracting users COPY block...')
    cols, lines = extract_users_copy(str(dump_path))
    if not cols:
        print('No COPY block found for users in dump.')
        return
    if not lines:
        print('Found users COPY block but it contains 0 rows; nothing to import.')
        return
    print(f'Found users COPY with {len(lines)} rows; sanitizing...')
    s_lines = sanitize_lines(lines)
    data = '\n'.join(s_lines) + '\n'

    print('Connecting to DB...')
    try:
        conn = psycopg2.connect(db_url, sslmode='require')
    except Exception as e:
        print('SSL connect failed:', e)
        print('Trying without ssl...')
        conn = psycopg2.connect(db_url)

    cur = conn.cursor()
    copy_sql = f"COPY public.users ({cols}) FROM STDIN;"
    try:
        cur.copy_expert(copy_sql, io.StringIO(data))
        conn.commit()
        print('Users COPY succeeded.')
    except Exception as e:
        conn.rollback()
        print('Users COPY failed:', e)
        # write failed data to a file for inspection
        out = pathlib.Path('failed_users_copy.txt')
        out.write_text(data, encoding='utf-8')
        print('Wrote failed data to', out)
    finally:
        cur.close()
        conn.close()


if __name__ == '__main__':
    main()
