const { verifyAccessToken } = require("../lib/tokens");

// Protects a route by requiring a valid, non-expired access token in the
// Authorization header. On success, attaches { id, role } to req.user.
// Expired tokens deliberately return 401 (not a refresh) — refreshing is
// the client's job, via /api/auth/refresh.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No access token provided" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Access token invalid or expired" });
  }
}

module.exports = { requireAuth };
