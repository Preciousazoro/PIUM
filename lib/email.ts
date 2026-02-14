import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'taskkash.web3@gmail.com',
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
  });
};

// Send email function
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"TaskKash" <${process.env.EMAIL_USER || 'taskkash.web3@gmail.com'}>`,
      to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Password reset email template
export function createPasswordResetEmail(resetUrl: string, userName?: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - TaskKash</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(45deg, #00ff9d, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .title {
          color: #333;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .reset-button {
          display: inline-block;
          background: linear-gradient(45deg, #00ff9d, #8a2be2);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .reset-button:hover {
          opacity: 0.9;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="${process.env.NODE_ENV === 'production' ? 'https://taskkash.xyz/taskkash-logo.png' : 'http://localhost:3000/taskkash-logo.png'}" alt="TaskKash Logo" style="width: 40px; height: 40px;" />
            <span class="logo-text">TaskKash</span>
          </div>
          <h1 class="title">Reset Your Password</h1>
        </div>
        
        <div class="content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          
          <p>We received a request to reset your password for your TaskKash account. Click the button below to set a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The TaskKash Team</p>
          <p style="font-size: 12px; color: #999;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Reset Your Password - TaskKash
    
    Hello${userName ? ` ${userName}` : ''},
    
    We received a request to reset your password for your TaskKash account. Visit the link below to set a new password:
    
    ${resetUrl}
    
    Important: This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The TaskKash Team
  `;

  return { html, text };
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<boolean> {
  const { html, text } = createPasswordResetEmail(resetUrl, userName);
  
  return await sendEmail({
    to: email,
    subject: 'Reset Your Password - TaskKash',
    html,
    text,
  });
}
