"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRY = '24h';
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not found in .env, using default secret');
}
console.log('JWT Configuration loaded - Secret length:', JWT_SECRET.length);
const generateToken = (payload) => {
    try {
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRY,
            algorithm: 'HS256'
        });
        console.log('✅ JWT token generated successfully for user:', payload.email);
        return token;
    }
    catch (error) {
        console.error('❌ Error generating JWT:', error);
        throw error;
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        });
        console.log('✅ JWT token verified successfully');
        return decoded;
    }
    catch (error) {
        console.error('❌ JWT verification error:', {
            name: error.name,
            message: error.message,
            expiredAt: error.expiredAt,
        });
        return null;
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        console.log('✅ JWT token decoded:', decoded);
        return decoded;
    }
    catch (error) {
        console.error('❌ JWT decode error:', error);
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.js.map