const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // keep in sync with REFRESH_TOKEN_EXPIRES_IN above

function signAccessToken(userId, role) {
  return jwt.sign({ id: userId, role }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

function signRefreshToken(userId) {
  // Refresh tokens intentionally carry no role/claims beyond the user id and
  // a random jti, so leaking one's *payload* (not the token itself) reveals
  // as little as possible. The jti also guarantees uniqueness even if two
  // tokens are issued in the same second.
  const jti = crypto.randomUUID();
  const token = jwt.sign({ id: userId, jti }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
  return token;
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

// We never store the raw refresh token, only this hash. A stolen database
// dump is therefore useless for forging sessions; an attacker would still
// need the original token value, which only ever lives in the httpOnly
// cookie on the client.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  REFRESH_TOKEN_EXPIRES_MS,
};
