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
  JWT_SECRET: jwtSecret
};
