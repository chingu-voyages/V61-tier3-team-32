const express = require("express");
const {
  verifyToken,
  isClaimer,
  isDonor,
} = require("../middleware/auth.middleware");
const {
  getMyClaims,
  getClaimDetails,
  confirmClaim,
  declineClaim,
  sendPickupDetails,
} = require("../controllers/claims.controller");

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
router.get("/mine", verifyToken, isClaimer, getMyClaims);

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Get claim details (donor only, must own the listing)
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
 *         description: Claim details with listing and claimer info
 */
router.get("/:id", verifyToken, isDonor, getClaimDetails);

/**
 * @swagger
 * /api/claims/{id}/confirm:
 *   put:
 *     summary: Confirm a pending claim
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
 *         description: Claim confirmed
 */
router.put("/:id/confirm", verifyToken, isDonor, confirmClaim);

/**
 * @swagger
 * /api/claims/{id}/decline:
 *   put:
 *     summary: Decline a pending claim (re-activates the listing, notifies claimer)
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
 *         description: Claim declined
 */
router.put("/:id/decline", verifyToken, isDonor, declineClaim);

/**
 * @swagger
 * /api/claims/{id}/details:
 *   put:
 *     summary: Send pickup address/contact details to the claimer
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickupAddress, contactEmail]
 *             properties:
 *               pickupAddress:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pickup details saved and sent to claimer as a notification
 */
router.put("/:id/details", verifyToken, isDonor, sendPickupDetails);

module.exports = router;
