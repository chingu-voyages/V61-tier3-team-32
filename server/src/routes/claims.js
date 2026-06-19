const express = require('express');
const { verifyToken, isClaimer } = require('../middleware/auth.middleware');
const { getMyClaims } = require('../controllers/claims.controller');

const router = express.Router();

/**
 * @swagger
 * /api/claims/mine:
 *   get:
 *     summary: Claimer dashboard claims
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of claims made by the user
 */
router.get('/mine', verifyToken, isClaimer, getMyClaims);

module.exports = router;
