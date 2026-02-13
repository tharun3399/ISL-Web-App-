import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRY = '24h';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not found in .env, using default secret');
}

console.log('JWT Configuration loaded - Secret length:', JWT_SECRET.length);

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: JWTPayload): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });
    console.log('✅ JWT token generated successfully for user:', payload.email);
    return token;
  } catch (error) {
    console.error('❌ Error generating JWT:', error);
    throw error;
  }
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as JWTPayload;
    console.log('✅ JWT token verified successfully');
    return decoded;
  } catch (error: any) {
    console.error('❌ JWT verification error:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
    });
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    console.log('✅ JWT token decoded:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ JWT decode error:', error);
    return null;
  }
};
