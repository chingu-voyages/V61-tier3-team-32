const prisma = require('../lib/prisma');

const createClaim = async (req, res) => {
  const { id: listingId } = req.params;
  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ message: 'Listing is no longer active' });

    const existingClaim = await prisma.claim.findFirst({
      where: { listingId, claimerId: req.user.id }
    });
    if (existingClaim) return res.status(400).json({ message: 'You have already claimed this listing' });

    const claim = await prisma.claim.create({
      data: {
        listingId,
        claimerId: req.user.id
      }
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'claimed' }
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error('Create Claim Error:', error);
    res.status(500).json({ message: 'Server error creating claim' });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { claimerId: req.user.id },
      include: { listing: true },
      orderBy: { claimedAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    console.error('Get My Claims Error:', error);
    res.status(500).json({ message: 'Server error fetching your claims' });
  }
};

const getListingClaims = async (req, res) => {
  const { id: listingId } = req.params;
  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to view claims for this listing' });

    const claims = await prisma.claim.findMany({
      where: { listingId },
      include: { claimer: { select: { id: true, name: true, email: true, city: true } } },
      orderBy: { claimedAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    console.error('Get Listing Claims Error:', error);
    res.status(500).json({ message: 'Server error fetching listing claims' });
  }
};

module.exports = { createClaim, getMyClaims, getListingClaims };
