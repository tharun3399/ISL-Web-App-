import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import os from 'os';
import pool, { closePool } from './config/database.js';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import lessonRoutes from './routes/lessons';
import topicsRoutes from './routes/topics';
import wordsRoutes from './routes/words';

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
app.use(cors());
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

// Initialize server
const startServer = async () => {
  try {
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
