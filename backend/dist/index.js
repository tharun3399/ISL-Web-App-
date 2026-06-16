"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const os_1 = __importDefault(require("os"));
const database_js_1 = __importStar(require("./config/database.js"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
const lessons_js_1 = __importDefault(require("./routes/lessons.js"));
const topics_js_1 = __importDefault(require("./routes/topics.js"));
const words_js_1 = __importDefault(require("./routes/words.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const getNetworkAddress = () => {
    const nets = os_1.default.networkInterfaces();
    for (const name of Object.keys(nets)) {
        const interfaces = nets[name];
        if (!interfaces)
            continue;
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
app.use((0, cors_1.default)({
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
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
// Database connection test
app.get('/db-check', async (req, res) => {
    try {
        const result = await database_js_1.default.query('SELECT NOW()');
        res.json({
            success: true,
            message: 'Database connection successful',
            timestamp: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// API Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/users', users_js_1.default);
app.use('/api/lessons', lessons_js_1.default);
app.use('/api/topics', topics_js_1.default);
app.use('/api/words', words_js_1.default);
// Root endpoint
app.get('/', (req, res) => {
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
        await (0, database_js_1.query)(dropLegacyForeignKey);
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
        await (0, database_js_1.query)(createEmailVerificationsTable);
        console.log('✅ Database schema initialized successfully');
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await (0, database_js_1.closePool)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await (0, database_js_1.closePool)();
    process.exit(0);
});
startServer();
