const prisma = require('../lib/prisma');
const { getSupabaseClient } = require('../lib/supabase');

const listingPhotoBucket = process.env.SUPABASE_LISTING_PHOTOS_BUCKET || 'listing-photos';

const uploadErrorResponse = (message, error) => {
  const response = { message };

  if (process.env.NODE_ENV !== 'production' && error) {
    response.details = error.message || String(error);
  }

  return response;
};

const getFileExtension = (filename = '') => {
  const extension = filename.split('.').pop();
  return extension && extension !== filename ? extension.toLowerCase() : 'jpg';
};

const getListings = async (req, res) => {
  const { city } = req.query;
  try {
    const query = {
      where: {
        status: 'active'
      },
      include: {
        donor: true
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
    const { photoUrl, ...listingData } = req.body;
    const data = { ...listingData, donorId: req.user.id };
    
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

const uploadListingPhoto = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Photo file is required' });
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.donorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const supabase = getSupabaseClient();
    const extension = getFileExtension(req.file.originalname);
    const filePath = `listings/${id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(listingPhotoBucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      return res
        .status(500)
        .json(uploadErrorResponse('Server error uploading listing photo', uploadError));
    }

    const { data: publicUrlData } = supabase.storage
      .from(listingPhotoBucket)
      .getPublicUrl(filePath);

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: { photoUrl: publicUrlData.publicUrl },
    });

    res.json({
      message: 'Listing photo uploaded successfully',
      photoUrl: updatedListing.photoUrl,
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Upload Listing Photo Error:', error);
    res
      .status(500)
      .json(uploadErrorResponse('Server error uploading listing photo', error));
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
      include: {
        donor: true
      },
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
  uploadListingPhoto,
  updateListing,
  deleteListing,
  getMyListings
};
