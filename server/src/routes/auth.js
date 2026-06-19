const express = require('express');
const { body } = require('express-validator');
const { signup, login, logout, refresh, getMe } = require('../controllers/auth.controller');
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
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange the httpOnly refresh cookie for a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns a new access token and the current user
 *       401:
 *         description: Refresh token missing, invalid, or expired
 */
router.post('/refresh', refresh);

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

module.exports = router;
