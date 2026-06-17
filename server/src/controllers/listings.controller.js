const prisma = require('../lib/prisma');

const getListings = async (req, res) => {
  const { city } = req.query;
  try {
    const query = {
      where: {
        status: 'active'
      },
      include: {
        donor: {
          select: { name: true, city: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    };
    
    if (city) {
      query.where.city = {
        equals: city,
        mode: 'insensitive'
      };
    }

    const listings = await prisma.listing.findMany(query);
    res.json(listings);
  } catch (error) {
    console.error('Get Listings Error:', error);
    res.status(500).json({ message: 'Server error fetching listings' });
  }
};

const createListing = async (req, res) => {
  try {
    const data = { ...req.body, donorId: req.user.id };
    
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    if (data.pickupStart) data.pickupStart = new Date(data.pickupStart);
    if (data.pickupEnd) data.pickupEnd = new Date(data.pickupEnd);

    const listing = await prisma.listing.create({ data });
    res.status(201).json(listing);
  } catch (error) {
    console.error('Create Listing Error:', error);
    res.status(500).json({ message: 'Server error creating listing' });
  }
};

const updateListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to update this listing' });

    const data = { ...req.body };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    if (data.pickupStart) data.pickupStart = new Date(data.pickupStart);
    if (data.pickupEnd) data.pickupEnd = new Date(data.pickupEnd);

    const updated = await prisma.listing.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (error) {
    console.error('Update Listing Error:', error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
};

const deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete this listing' });

    await prisma.listing.delete({ where: { id } });
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete Listing Error:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { donorId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listings);
  } catch (error) {
    console.error('Get My Listings Error:', error);
    res.status(500).json({ message: 'Server error fetching your listings' });
  }
};

module.exports = {
  getListings,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};
