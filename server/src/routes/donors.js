const express = require('express');
const {
  getDonorProfile,
  getDonorListings,
  getDonorRatings,
  getDonorStats,
} = require('../controllers/donors.controller.js');

const router = express.Router();

router.get('/:donorId', getDonorProfile);
router.get('/:donorId/listings', getDonorListings);
router.get('/:donorId/ratings', getDonorRatings);
router.get('/:donorId/stats', getDonorStats);

module.exports = router;
