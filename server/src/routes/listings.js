const express = require('express');
const { verifyToken, isDonor, isClaimer } = require('../middleware/auth.middleware');
const {
  getListings,
  createListing,
  uploadListingPhoto,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listings.controller');
const { createClaim, getListingClaims } = require('../controllers/claims.controller');
const { singleImageUpload } = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Public feed of active listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter listings by city
 *     responses:
 *       200:
 *         description: List of active listings
 */
router.get('/', getListings);

/**
 * @swagger
 * /api/listings/mine:
 *   get:
 *     summary: Poster dashboard listings
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owned listings
 */
router.get('/mine', verifyToken, isDonor, getMyListings);

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Listing created
 */
router.post('/', verifyToken, isDonor, createListing);

/**
 * @swagger
 * /api/listings/{id}/photo:
 *   post:
 *     summary: Upload a photo for an owned listing
 *     tags: [Listings]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Listing photo uploaded
 */
router.post('/:id/photo', verifyToken, isDonor, singleImageUpload('photo'), uploadListingPhoto);

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Update an owned listing
 *     tags: [Listings]
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
 *     responses:
 *       200:
 *         description: Listing updated
 */
router.put('/:id', verifyToken, isDonor, updateListing);

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Delete an owned listing
 *     tags: [Listings]
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
 *         description: Listing deleted
 */
router.delete('/:id', verifyToken, isDonor, deleteListing);

/**
 * @swagger
 * /api/listings/{id}/claim:
 *   post:
 *     summary: Claim a listing
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
 *       201:
 *         description: Listing claimed
 */
router.post('/:id/claim', verifyToken, isClaimer, createClaim);

/**
 * @swagger
 * /api/listings/{id}/claims:
 *   get:
 *     summary: View claims on owned listing
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
 *         description: List of claims for the listing
 */
router.get('/:id/claims', verifyToken, isDonor, getListingClaims);

module.exports = router;
