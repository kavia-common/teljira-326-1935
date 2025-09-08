const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { totp } = require('otplib');
const { User } = require('../models/User');
const { HttpError } = require('../setup/errors');

// PUBLIC_INTERFACE
async function register({ email, name, password }) {
  /** Registers a new user with email+password */
  const exists = await User.query().findOne({ email });
  if (exists) throw new HttpError(400, 'email_exists', 'Email already registered');
  const hash = password ? await argon2.hash(password) : null;
  const user = await User.query().insertAndFetch({ email, name, password_hash: hash });
  return user;
}

// PUBLIC_INTERFACE
async function login({ email, password, mfaToken }) {
  /** Authenticates user and returns a JWT. If MFA is enabled, mfaToken must be provided. */
  const user = await User.query().findOne({ email });
  if (!user) throw new HttpError(401, 'invalid_credentials', 'Invalid credentials');
  if (!user.password_hash || !(await argon2.verify(user.password_hash, password || ''))) {
    throw new HttpError(401, 'invalid_credentials', 'Invalid credentials');
  }
  let mfaOk = !user.mfa_enabled;
  if (user.mfa_enabled) {
    if (!mfaToken) throw new HttpError(401, 'mfa_required', 'MFA token required');
    totp.options = { window: 1 };
    mfaOk = totp.verify({ token: mfaToken, secret: user.mfa_secret });
  }
  if (!mfaOk) throw new HttpError(401, 'invalid_mfa', 'Invalid MFA token');

  const token = jwt.sign({ sub: user.id, mfa: user.mfa_enabled }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

// PUBLIC_INTERFACE
async function enableMfa(userId, { secret }) {
  /** Enables MFA using provided TOTP secret (generated client-side or via another endpoint) */
  const user = await User.query().patchAndFetchById(userId, { mfa_enabled: true, mfa_secret: secret });
  return { mfa_enabled: user.mfa_enabled };
}

module.exports = { register, login, enableMfa };
