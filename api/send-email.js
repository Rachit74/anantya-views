import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullname, department } = req.body;

  // Validate required fields
  if (!email || !fullname) {
    return res.status(400).json({ error: 'Email and fullname are required' });
  }

  // SMTP configuration from environment variables
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('SMTP credentials not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Email content
  const departments = Array.isArray(department) ? department.join(', ') : department || 'Not specified';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #2c5f2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to Anantya Foundation!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 18px;">Dear ${fullname},</p>
        <p>Thank you for registering as a volunteer with <strong>Anantya Foundation</strong>!</p>
        <p>We have received your application with the following details:</p>
        <ul style="background: white; padding: 15px 30px; border-radius: 4px; border: 1px solid #e0e0e0;">
          <li><strong>Name:</strong> ${fullname}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Preferred Department(s):</strong> ${departments}</li>
        </ul>
        <p>Your application is currently being reviewed by our team. You will receive a confirmation with your <strong>Member ID</strong> within 5-10 minutes after approval.</p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p style="margin-top: 30px;">Warm regards,<br><strong>Anantya Foundation Team</strong></p>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to Anantya Foundation!

Dear ${fullname},

Thank you for registering as a volunteer with Anantya Foundation!

We have received your application with the following details:
- Name: ${fullname}
- Email: ${email}
- Preferred Department(s): ${departments}

Your application is currently being reviewed by our team. You will receive a confirmation with your Member ID within 5-10 minutes after approval.

If you have any questions, feel free to reach out to us.

Warm regards,
Anantya Foundation Team

This is an automated message. Please do not reply to this email.
  `;

  try {
    // Send email
    const info = await transporter.sendMail({
      from: `"Anantya Foundation" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Anantya Foundation - Registration Received',
      text: textContent,
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}