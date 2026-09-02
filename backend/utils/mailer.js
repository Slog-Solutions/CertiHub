/**
 * SMTP Email Utility — CertiHub Backend
 * backend/utils/mailer.js
 *
 * Sends emails via SMTP configuration set in backend/.env
 */
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_HOST) {
    console.log('[SMTP] EMAIL_HOST or EMAIL_USER not configured in .env — skipping real email send.');
    return { success: false, reason: 'SMTP not configured in .env' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Slog Solutions" <noreply@slogsolutions.com>',
      to,
      subject,
      text,
      html
    });

    console.log(`[SMTP] Email sent to ${to} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[SMTP] Error sending email to ${to}:`, err.message);
    return { success: false, reason: err.message };
  }
};

module.exports = { sendEmail };
