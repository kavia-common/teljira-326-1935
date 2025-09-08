const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

async function hashPassword(password) {
  const pepper = process.env.PASSWORD_PEPPER || '';
  return argon2.hash(password + pepper);
}

async function verifyPassword(hash, password) {
  const pepper = process.env.PASSWORD_PEPPER || '';
  return argon2.verify(hash, password + pepper);
}

function signJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { expiresIn, subject: payload.sub });
}

module.exports = { hashPassword, verifyPassword, signJwt };
