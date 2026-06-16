import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import os from 'os';
import pool, { closePool, query } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import lessonRoutes from './routes/lessons.js';
import topicsRoutes from './routes/topics.js';
import wordsRoutes from './routes/words.js';

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const getNetworkAddress = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    for (const net of interfaces) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
};

// Middleware
// Configure CORS to allow requests from frontend origins
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'https://isl-web-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database connection test
app.get('/db-check', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/words', wordsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'ISL Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      dbCheck: '/db-check',
      users: '/api/users',
    },
  });
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    console.log('📊 Initializing database schema...');

    // Ensure old foreign key constraint is removed.
    // Verification records are created before a user exists, so this FK is invalid.
    const dropLegacyForeignKey = `
      ALTER TABLE IF EXISTS email_verifications
      DROP CONSTRAINT IF EXISTS fk_email_verifications_email;
    `;
    await query(dropLegacyForeignKey);
    
    // Create email_verifications table if it doesn't exist
    const createEmailVerificationsTable = `
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        code_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP,
        attempts INT DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
      CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
    `;

    await query(createEmailVerificationsTable);
    console.log('✅ Database schema initialized successfully');
  } catch (error: any) {
    console.error('⚠️  Error initializing database:', error.message);
    // Continue anyway - table might already exist
  }
};

// Initialize server
const startServer = async () => {
  try {
    // Initialize database schema
    await initializeDatabase();

    app.listen(PORT, HOST, () => {
      const localUrl = `http://localhost:${PORT}`;
      const resolvedNetworkIp = HOST === '0.0.0.0' ? getNetworkAddress() : HOST;
      const networkUrl = resolvedNetworkIp ? `http://${resolvedNetworkIp}:${PORT}` : 'Network IP not detected';
      console.log(`🚀 Server is running on ${localUrl}`);
      console.log(`🌐 Accessible on network via ${networkUrl}`);
      console.log(`📊 Database: ${process.env.DB_NAME || 'demodb'}`);
      console.log(`🔗 Health check: ${localUrl}/health`);
      console.log(`📝 Auth endpoints: ${localUrl}/api/auth`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

startServer();
