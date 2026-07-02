const prisma = require("../lib/prisma");
const { getSupabaseClient } = require("../lib/supabase");

const listingPhotoBucket =
  process.env.SUPABASE_LISTING_PHOTOS_BUCKET || "listing-photos";

const uploadErrorResponse = (message, error) => {
  const response = { message };

  if (process.env.NODE_ENV !== "production" && error) {
    response.details = error.message || String(error);
  }

  return response;
};

const getFileExtension = (filename = "") => {
  const extension = filename.split(".").pop();
  return extension && extension !== filename ? extension.toLowerCase() : "jpg";
};

const getListings = async (req, res) => {
  const { city, status, excludeExpired, page = "1", limit = "12" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  try {
    // Lazily expire anything past its window before reading.
    await prisma.listing.updateMany({
      where: { status: "active", expiresAt: { lt: new Date() } },
      data: { status: "expired" },
    });

    const where = {};

    const validStatuses = ["active", "claimed", "expired", "completed"];
    if (status && status !== "all") {
      const statuses = status
        .split(",")
        .map((s) => s.trim())
        .filter((s) => validStatuses.includes(s));
      if (statuses.length === 0) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: all, ${validStatuses.join(", ")}`,
        });
      }
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }
    // status omitted or "all" => no status filter, every listing is returned

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (excludeExpired === "true") {
      where.expiresAt = { gt: new Date() };
    }

    const [listings, total] = await prisma.$transaction([
      prisma.listing.findMany({
        where,
        include: {
          donor: { select: { name: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (error) {
    console.error("Get Listings Error:", error);
    res.status(500).json({ message: "Server error fetching listings" });
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
    console.error("Create Listing Error:", error);
    res.status(500).json({ message: "Server error creating listing" });
  }
};

const uploadListingPhoto = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "Photo file is required" });
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.donorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this listing" });
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
      console.error("Supabase Upload Error:", uploadError);
      return res
        .status(500)
        .json(
          uploadErrorResponse(
            "Server error uploading listing photo",
            uploadError,
          ),
        );
    }

    const { data: publicUrlData } = supabase.storage
      .from(listingPhotoBucket)
      .getPublicUrl(filePath);

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: { photoUrl: publicUrlData.publicUrl },
    });

    res.json({
      message: "Listing photo uploaded successfully",
      photoUrl: updatedListing.photoUrl,
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Upload Listing Photo Error:", error);
    res
      .status(500)
      .json(uploadErrorResponse("Server error uploading listing photo", error));
  }
};

const updateListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.donorId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to update this listing" });

    const data = { ...req.body };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    if (data.pickupStart) data.pickupStart = new Date(data.pickupStart);
    if (data.pickupEnd) data.pickupEnd = new Date(data.pickupEnd);

    const updated = await prisma.listing.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (error) {
    console.error("Update Listing Error:", error);
    res.status(500).json({ message: "Server error updating listing" });
  }
};

const deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.donorId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this listing" });

    await prisma.listing.delete({ where: { id } });
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete Listing Error:", error);
    res.status(500).json({ message: "Server error deleting listing" });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { donorId: req.user.id },
      include: {
        donor: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(listings);
  } catch (error) {
    console.error("Get My Listings Error:", error);
    res.status(500).json({ message: "Server error fetching your listings" });
  }
};

module.exports = {
  getListings,
  createListing,
  uploadListingPhoto,
  updateListing,
  deleteListing,
  getMyListings,
};
