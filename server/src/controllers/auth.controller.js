const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const prisma = require("../lib/prisma");
const { sendPasswordResetEmail } = require("../lib/mailer");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  REFRESH_TOKEN_EXPIRES_MS,
} = require("../lib/tokens");
const { setRefreshCookie, clearRefreshCookie } = require("../lib/cookies");

// Issues a fresh access+refresh pair for a user, persists the refresh
// token's hash, and sets the httpOnly cookie on the response. Returns just
// the access token, since the refresh token never needs to leave this file.
async function issueTokens(res, user) {
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    },
  });

  setRefreshCookie(res, refreshToken);
  return accessToken;
}

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, city } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        city
      }
    });

    const accessToken = await issueTokens(res, user);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city },
      token: accessToken
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = await issueTokens(res, user);

    res.json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city },
      token: accessToken
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Reads the refresh token from the httpOnly cookie, verifies it against the
// stored hash (so a revoked or already-rotated token is rejected even if
// its JWT signature is still valid until expiry), rotates it, and returns a
// new access token. Called silently by the client whenever an access token
// expires.
const refresh = async (req, res) => {
  const token = req.cookies?.foodrescue_refresh;
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const payload = verifyRefreshToken(token);
    const tokenHash = hashToken(token);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Reusing a revoked/rotated token is a strong signal of theft or a
      // race condition. Defensive move: kill every refresh token this user
      // has, forcing a clean re-login everywhere.
      if (stored && !stored.revokedAt) {
        await prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({
          message: "Refresh token invalid or expired, please log in again",
        });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Rotate: revoke the used token, issue a brand new pair.
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = await issueTokens(res, user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res
      .status(401)
      .json({
        message: "Refresh token invalid or expired, please log in again",
      });
  }
};

// Revokes the current refresh token and clears the cookie. The access token
// itself can't be revoked (it's stateless and short-lived by design), so it
// simply expires naturally within 15 minutes.
const logout = async (req, res) => {
  const token = req.cookies?.foodrescue_refresh;

  if (token) {
    try {
      const tokenHash = hashToken(token);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      // Token may already be invalid/expired — fine, we're logging out anyway.
    }
  }

  clearRefreshCookie(res);
  res.json({ message: "Logged out successfully" });
};



const getMe = (req, res) => {
  res.json({ user: req.user });
};

// Generates a secure random token, stores its hash in the DB (expires in 1 h),
// and emails a reset link to the user. Always returns 200 so we never reveal
// whether a given email is registered.
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Invalidate any existing unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    }

    // Always return 200 regardless of whether the email exists
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Validates the reset token and updates the user's password.
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password || password.length < 8) {
    return res.status(400).json({ message: "Token and a password of at least 8 characters are required." });
  }

  try {
    const tokenHash = hashToken(token);
    const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all existing refresh tokens to force re-login everywhere
      prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    res.json({ message: "Password updated successfully. Please log in with your new password." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { signup, login, logout, getMe, forgotPassword, resetPassword, refresh };
