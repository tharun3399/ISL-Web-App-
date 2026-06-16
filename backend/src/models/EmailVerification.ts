import { query } from '../config/database';
import crypto from 'crypto';

export interface EmailVerificationRecord {
  id: number;
  email: string;
  code_hash: string;
  created_at: Date;
  expires_at: Date;
  verified_at: Date | null;
  attempts: number;
}

const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_CODE_TTL_MINUTES = 10;
const VERIFICATION_MAX_ATTEMPTS = 5;

export class EmailVerificationModel {
  static generateVerificationCode(): string {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static hashVerificationCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  static async upsert(email: string, codeHash: string): Promise<EmailVerificationRecord> {
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);
    
    const text = `
      INSERT INTO email_verifications (email, code_hash, created_at, expires_at, verified_at, attempts)
      VALUES ($1, $2, NOW(), $3, NULL, 0)
      ON CONFLICT (email) 
      DO UPDATE SET 
        code_hash = $2, 
        created_at = NOW(), 
        expires_at = $3, 
        verified_at = NULL, 
        attempts = 0
      RETURNING id, email, code_hash, created_at, expires_at, verified_at, attempts;
    `;
    
    const res = await query(text, [email, codeHash, expiresAt]);
    return res.rows[0];
  }

  static async findByEmail(email: string): Promise<EmailVerificationRecord | null> {
    const text = 'SELECT * FROM email_verifications WHERE email = $1';
    const res = await query(text, [email]);
    return res.rows.length ? res.rows[0] : null;
  }

  static async isVerified(email: string): Promise<boolean> {
    const text = 'SELECT verified_at FROM email_verifications WHERE email = $1 AND verified_at IS NOT NULL';
    const res = await query(text, [email]);
    return res.rows.length > 0;
  }

  static async consumeVerification(email: string, code: string): Promise<boolean> {
    try {
      const record = await this.findByEmail(email);
      
      if (!record) {
        console.warn('No verification record found for email:', email);
        return false;
      }

      // Check if expired
      if (new Date() > new Date(record.expires_at)) {
        console.warn('Verification code expired for email:', email);
        return false;
      }

      // Check max attempts
      if (record.attempts >= VERIFICATION_MAX_ATTEMPTS) {
        console.warn('Max verification attempts exceeded for email:', email);
        return false;
      }

      const codeHash = this.hashVerificationCode(code);

      // Verify code
      if (codeHash !== record.code_hash) {
        // Increment attempts
        const updateText = 'UPDATE email_verifications SET attempts = attempts + 1 WHERE email = $1';
        await query(updateText, [email]);
        console.warn('Invalid verification code for email:', email);
        return false;
      }

      // Mark as verified
      const verifyText = 'UPDATE email_verifications SET verified_at = NOW() WHERE email = $1';
      await query(verifyText, [email]);
      
      console.log('✅ Email verified:', email);
      return true;
    } catch (error) {
      console.error('Error consuming verification:', error);
      return false;
    }
  }

  static async incrementAttempts(email: string): Promise<number> {
    const text = 'UPDATE email_verifications SET attempts = attempts + 1 WHERE email = $1 RETURNING attempts';
    const res = await query(text, [email]);
    return res.rows[0]?.attempts || 0;
  }

  static async delete(email: string): Promise<void> {
    const text = 'DELETE FROM email_verifications WHERE email = $1';
    await query(text, [email]);
  }
}
