import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    const config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Weight Tracker <noreply@weighttracker.com>',
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Test email functionality
  async sendTestEmail(to) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Weight Tracker Email Test</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this, your email notifications are ready!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          Sent from your Weight Tracker application
        </p>
      </div>
    `;

    return this.sendEmail(to, 'Weight Tracker - Email Test', html);
  }
}

export default new EmailService();
