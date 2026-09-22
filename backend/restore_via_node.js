const fs = require('fs');
const { Client } = require('pg');

async function restore({ sqlFile, connectionString }) {
  if (!fs.existsSync(sqlFile)) throw new Error(`SQL file not found: ${sqlFile}`);
  console.log('Reading SQL file...');
  let sql = fs.readFileSync(sqlFile, 'utf8');

  // Remove psql meta-commands (lines starting with backslash) which are not valid SQL
  sql = sql.split(/\r?\n/).filter(l => !l.trim().startsWith('\\')).join('\n');

  // Optionally remove the pg_dump restrict token lines that begin with --\n or similar — already safe

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();
  try {
    console.log('Beginning transaction and executing SQL (this may take a while)...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Restore completed successfully.');

    // Quick verification sample queries
    try {
      const res = await client.query("SELECT to_char(now(),'YYYY-MM-DD HH24:MI:SS') AS now");
      console.log('Server time:', res.rows[0].now);
    } catch (e) {
      console.warn('Could not run verification query:', e.message);
    }
  } catch (err) {
    console.error('Error during restore, attempting ROLLBACK:', err.message);
    try { await client.query('ROLLBACK'); } catch (e) { console.error('Rollback failed:', e.message); }
    throw err;
  } finally {
    await client.end();
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node restore_via_node.js <sqlFile> <connectionString>');
    process.exit(1);
  }
  const [sqlFile, connectionString] = args;
  restore({ sqlFile, connectionString }).catch(err => {
    console.error('Restore failed:', err);
    process.exit(2);
  });
}

module.exports = { restore };
