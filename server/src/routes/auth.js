const express = require('express');
const { body } = require('express-validator');
const { signup, login, logout, getMe, forgotPassword, resetPassword, refresh } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               city:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [donor, claimer]
 *     responses:
 *       201:
 *         description: User registered successfully. Sets an httpOnly refresh token cookie and returns a short-lived access token.
 *       400:
 *         description: Validation error or user exists
 */
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['donor', 'claimer']).withMessage('Role must be donor or claimer')
], signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully. Sets an httpOnly refresh token cookie and returns a short-lived access token.
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', verifyToken, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user data
 */
router.get('/me', verifyToken, getMe);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent (always 200 to avoid email enumeration)
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password using a valid token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], resetPassword);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rotate refresh token and return a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns new access token and sets a rotated refresh cookie
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refresh);

module.exports = router;
