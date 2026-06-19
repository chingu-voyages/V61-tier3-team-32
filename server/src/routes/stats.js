const express = require('express');
const { verifyToken, isDonor, isClaimer } = require('../middleware/auth.middleware');
const { getPosterStats, getClaimerStats } = require('../controllers/stats.controller');

const router = express.Router();

/**
 * @swagger
 * /api/stats/poster:
 *   get:
 *     summary: Poster counters
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Poster statistics
 */
router.get('/poster', verifyToken, isDonor, getPosterStats);

/**
 * @swagger
 * /api/stats/claimer:
 *   get:
 *     summary: Claimer counters
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Claimer statistics
 */
router.get('/claimer', verifyToken, isClaimer, getClaimerStats);

module.exports = router;
