const crypto = require('crypto');

// In production, a missing JWT_SECRET is a hard failure — never run with a
// guessable/shared default in a real deployment.
// In development, we generate a random secret per-process-start so there is
// never a hardcoded fallback checked into source control. Note: this means
// existing tokens are invalidated on every dev server restart, which is the
// correct, safe behavior for a secret that was never actually configured.
let jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start in production without a configured secret. ' +
      'Set JWT_SECRET in your .env file (see .env.example).'
    );
  }
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn(
    '\n[WARN] JWT_SECRET is not set in .env — using a random secret for this session only.\n' +
    '       All existing tokens will be invalidated on restart. Set JWT_SECRET in .env to fix this.\n'
  );
}

module.exports = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slogsolutions',
  JWT_SECRET: jwtSecret,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  BACKUP_RETENTION: parseInt(process.env.BACKUP_RETENTION, 10) || 7,
  
  // Email configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 2525,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"Slog Solutions Platform" <noreply@slogsolutions.com>',

  // Certificate template defaults
  COMPANY_NAME: process.env.COMPANY_NAME || 'SLOG Solutions Private Limited',
  WEBSITE_URL: process.env.WEBSITE_URL || 'www.slogsolutions.com',
  LEFT_SIGN_NAME: process.env.LEFT_SIGN_NAME || 'Suraj Prasad Singh',
  RIGHT_SIGN_NAME: process.env.RIGHT_SIGN_NAME || 'Kiran Bisht'
};
