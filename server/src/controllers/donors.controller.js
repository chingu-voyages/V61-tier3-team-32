const db = require('../lib/prisma');

const getDonorProfile = async (req, res) => {
  try {
    const { donorId } = req.params;

    const donor = await db.user.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        role: true,
        createdAt: true,
      },
    });

    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json(donor);
  } catch (error) {
    console.error('Get donor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch donor profile' });
  }
};

const getDonorListings = async (req, res) => {
  try {
    const { donorId } = req.params;

    const listings = await db.listing.findMany({
      where: {
        donorId,
        status: 'active',
      },
      select: {
        id: true,
        title: true,
        quantity: true,
        expiresAt: true,
        photoUrl: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    res.json(listings);
  } catch (error) {
    console.error('Get donor listings error:', error);
    res.status(500).json({ error: 'Failed to fetch donor listings' });
  }
};

const getDonorRatings = async (req, res) => {
  try {
    const { donorId } = req.params;

    // Get ratings for claims made by this donor's listings
    const ratings = await db.rating.findMany({
      where: {
        claim: {
          listing: {
            donorId,
          },
        },
      },
      select: {
        id: true,
        score: true,
        comment: true,
        claim: {
          select: {
            claimer: {
              select: {
                name: true,
              },
            },
            claimedAt: true,
          },
        },
      },
      orderBy: {
        claim: {
          claimedAt: 'desc',
        },
      },
      take: 5,
    });

    const formattedRatings = ratings.map((rating) => ({
      id: rating.id,
      score: rating.score,
      reviewText: rating.comment || 'No comment provided',
      createdAt: rating.claim.claimedAt,
      reviewerName: rating.claim.claimer?.name || 'Anonymous',
      rating: rating.score,
    }));

    res.json(formattedRatings);
  } catch (error) {
    console.error('Get donor ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch donor ratings' });
  }
};

const getDonorStats = async (req, res) => {
  try {
    const { donorId } = req.params;

    // Get all completed claims for this donor's listings
    const claims = await db.claim.findMany({
      where: {
        listing: {
          donorId,
        },
        status: 'confirmed',
      },
      include: {
        listing: true,
        ratings: true,
      },
    });

    // Calculate stats
    const mealsShared = claims.length;
    const carbonSaved = claims.reduce((sum, claim) => {
      // Estimate 2kg CO2 saved per meal (typical food waste footprint)
      const quantity = parseInt(claim.listing.quantity) || 1;
      return sum + (quantity * 2);
    }, 0);

    // Get average rating
    const allRatings = claims.flatMap((claim) => claim.ratings.map((r) => r.score));
    const communityRating = allRatings.length > 0
      ? (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1)
      : 0;

    res.json({
      communityRating: parseFloat(communityRating),
      mealsShared,
      carbonSaved,
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch donor stats' });
  }
};

module.exports = {
  getDonorProfile,
  getDonorListings,
  getDonorRatings,
  getDonorStats,
};
