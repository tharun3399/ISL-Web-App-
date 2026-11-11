import nodemailer from 'nodemailer';

const smtpEmail = process.env.SMTP_EMAIL?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.replace(/\s+/g, '');
const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

const transporter = smtpEmail && smtpPassword
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    })
  : null;

export async function sendVerificationEmail(
  recipientEmail: string,
  verificationCode: string
): Promise<boolean> {
  try {
    if (!transporter || !smtpEmail) {
      console.error('❌ SMTP is not configured. Set SMTP_EMAIL and SMTP_PASSWORD.');
      return false;
    }

    console.log('📧 Sending verification email to:', recipientEmail);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 500px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { color: #333; text-align: center; margin-bottom: 20px; }
          .code-box { background: #f0f0f0; border: 2px solid #4CAF50; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="header">Email Verification Required</h2>
          <p>Hi,</p>
          <p>Thank you for signing up! To complete your account registration, please verify your email using the code below:</p>
          
          <div class="code-box">
            <div class="code">${verificationCode}</div>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          
          <div class="footer">
            <p>ISL Hub - Interactive Sign Language Learning Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: smtpEmail,
      to: recipientEmail,
      subject: 'Email Verification - ISL Hub',
      html: htmlContent,
      text: `Your verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!transporter) {
      console.error('❌ SMTP is not configured. Set SMTP_EMAIL and SMTP_PASSWORD.');
      return false;
    }

    console.log('🧪 Testing email connection...');
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return false;
  }
}
