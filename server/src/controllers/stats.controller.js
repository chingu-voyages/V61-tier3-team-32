const prisma = require('../lib/prisma');

const getPosterStats = async (req, res) => {
  try {
    const activeListingsCount = await prisma.listing.count({
      where: { donorId: req.user.id, status: 'active' }
    });
    const completedListingsCount = await prisma.listing.count({
      where: { donorId: req.user.id, status: 'completed' }
    });
    const totalClaimsCount = await prisma.claim.count({
      where: { listing: { donorId: req.user.id } }
    });

    res.json({
      activeListings: activeListingsCount,
      completedListings: completedListingsCount,
      totalClaimsReceived: totalClaimsCount
    });
  } catch (error) {
    console.error('Get Poster Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching poster stats' });
  }
};

const getClaimerStats = async (req, res) => {
  try {
    const activeClaimsCount = await prisma.claim.count({
      where: { claimerId: req.user.id, status: 'pending' }
    });
    const completedClaimsCount = await prisma.claim.count({
      where: { claimerId: req.user.id, status: 'confirmed' }
    });

    res.json({
      activeClaims: activeClaimsCount,
      completedClaims: completedClaimsCount
    });
  } catch (error) {
    console.error('Get Claimer Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching claimer stats' });
  }
};

module.exports = { getPosterStats, getClaimerStats };
