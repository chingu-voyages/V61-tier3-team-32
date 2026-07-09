const express = require('express');
const { verifyToken, isClaimer } = require('../middleware/auth.middleware');
const { getMyClaims, getClaimById } = require('../controllers/claims.controller');

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

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Get a single claim by ID (claimer only)
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim detail with listing and donor info
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Claim not found
 */
router.get('/:id', verifyToken, isClaimer, getClaimById);

module.exports = router;

