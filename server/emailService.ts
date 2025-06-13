import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, username: string, token: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Email verification would be sent to ${email} with token: ${token}`);
    console.log(`Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`);
    return true; // Return true for development without SendGrid
  }

  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      subject: 'Verify Your Educational Consultation Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Educational Consultation</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${username}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for creating your educational consultation account. To complete your registration and start your journey toward studying abroad, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify My Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            Educational Consultation Platform<br>
            Your trusted partner for study abroad guidance
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Welcome email would be sent to ${email}`);
    return true;
  }

  try {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      subject: 'Welcome to Your Educational Journey!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Welcome ${firstName}!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Educational Journey Begins Now</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! Your email has been verified and your account is now active. We're excited to help you achieve your study abroad dreams.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Explore study destinations and programs</li>
                <li>Schedule a consultation with our experts</li>
                <li>Access personalized guidance and resources</li>
                <li>Connect with other students on similar journeys</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                 style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Start Your Journey
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Need help getting started? Our support team is here to assist you every step of the way.
            </p>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            Educational Consultation Platform<br>
            Your trusted partner for study abroad guidance
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid welcome email error:', error);
    return false;
  }
}