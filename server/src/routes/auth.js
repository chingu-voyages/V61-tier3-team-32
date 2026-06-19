const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout } = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
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
 *               role:
 *                 type: string
 *                 enum: [donor, claimer]
 *     responses:
 *       201:
 *         description: User registered successfully. Sets an httpOnly refresh token cookie and returns a short-lived access token.
 *       400:
 *         description: Validation error or user exists
 */
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['donor', 'claimer']).withMessage('Role must be donor or claimer')
], register);

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
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a valid refresh token cookie for a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued, refresh token rotated
 *       401:
 *         description: Refresh token missing, invalid, expired, or revoked
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Revoke the current refresh token and clear the cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

module.exports = router;
