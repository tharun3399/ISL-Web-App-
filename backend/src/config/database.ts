import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('📊 Database Configuration:');
console.log('  Host:', process.env.DB_HOST);
console.log('  Port:', process.env.DB_PORT);
console.log('  Database:', process.env.DB_NAME);
console.log('  User:', process.env.DB_USER);
console.log('  Password length:', process.env.DB_PASSWORD?.length || 0);

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  console.log('  Connection mode: DATABASE_URL');
} else {
  console.log('  Connection mode: DB_HOST/DB_PORT/DB_NAME/DB_USER');
}

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'isl_database',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (
  text: string,
  params?: Array<any>
): Promise<any> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', error);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;
