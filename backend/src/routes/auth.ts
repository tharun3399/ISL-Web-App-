import express, { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken, verifyToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { OAuth2Client } from 'google-auth-library';

const router: Router = express.Router();

// Initialize Google OAuth Client
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

// Sign up - Create new user
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    console.log('📝 Signup attempt for email:', email);

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      console.warn('⚠️  Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      console.warn('⚠️  Passwords do not match');
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      console.warn('⚠️  Email already registered:', email);
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Create user
    const user = await UserModel.create(name, email, phone, password);
    console.log('✅ User created successfully:', email);

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
    });
  }
});

// Login - Authenticate user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate credentials
    const user = await UserModel.validatePassword(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

// Verify token
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const authHeader = req.headers.authorization;
    
    // Accept token from body or Authorization header (Bearer token)
    let tokenToVerify = token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      tokenToVerify = authHeader.slice(7);
    }

    if (!tokenToVerify) {
      console.warn('⚠️  No token provided for verification');
      return res.status(400).json({
        success: false,
        error: 'Token is required (provide in body as "token" or in Authorization header as "Bearer <token>")',
      });
    }

    console.log('🔐 Verifying token...');
    const decoded = verifyToken(tokenToVerify);
    
    if (!decoded) {
      console.warn('⚠️  Token verification failed');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    console.log('✅ Token verified for user:', decoded.email);
    res.json({
      success: true,
      message: 'Token is valid',
      data: decoded,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed',
    });
  }
});

// Google OAuth - Verify Google credential and create/login user
router.post('/google', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Google OAuth endpoint called');
    const { code } = req.body;

    if (!code) {
      console.warn('⚠️  No code provided');
      return res.status(400).json({
        success: false,
        error: 'Google authorization code is required',
      });
    }

    if (!googleClient) {
      console.error('❌ Google Client ID not configured - googleClient is null');
      console.error('GOOGLE_CLIENT_ID env:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
      return res.status(500).json({
        success: false,
        error: 'Google authentication is not configured on server',
      });
    }

    console.log('✅ Google Client configured, processing code...');

    // Exchange authorization code for tokens
    let tokens;
    try {
      const response = await googleClient.getToken(code);
      tokens = response.tokens;
      console.log('✅ Token exchange successful');
    } catch (error: any) {
      console.error('❌ Token exchange failed:', error.message);
      return res.status(401).json({
        success: false,
        error: `Token exchange failed: ${error.message}`,
      });
    }
    
    if (!tokens.id_token) {
      console.error('❌ No ID token in response');
      return res.status(401).json({
        success: false,
        error: 'Failed to get ID token from Google',
      });
    }

    // Verify the ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: googleClientId,
      });
      console.log('✅ ID token verified');
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        error: `Token verification failed: ${error.message}`,
      });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      console.error('❌ No payload from ticket');
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token payload',
      });
    }

    const { email, name, picture } = payload;
    console.log('✅ Extracted from payload - Email:', email, 'Name:', name);

    if (!email) {
      console.error('❌ No email in payload');
      return res.status(401).json({
        success: false,
        error: 'Could not retrieve email from Google account',
      });
    }

    console.log('✅ Google token verified for:', email);

    // Check if user exists
    let user = await UserModel.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user with Google info
      console.log('📝 Creating new user from Google auth:', email);
      // Generate a secure random password for Google users (they won't use it)
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      user = await UserModel.create(
        name || email.split('@')[0],
        email,
        '', // Empty phone for Google users
        randomPassword
      );
      isNewUser = true;
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    console.log('✅ Google login successful for:', email);

    res.json({
      success: true,
      message: 'Google authentication successful',
      isNewUser,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Google auth error:', error.message);
    console.error('Full error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Google authentication failed',
      details: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
  }
});

export default router;
