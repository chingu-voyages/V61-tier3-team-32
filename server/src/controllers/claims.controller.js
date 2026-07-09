const prisma = require("../lib/prisma");

const createClaim = async (req, res) => {
  const { id: listingId } = req.params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status !== "active")
      return res.status(400).json({ message: "Listing is no longer active" });

    const existingClaim = await prisma.claim.findFirst({
      where: { listingId, claimerId: req.user.id },
    });
    if (existingClaim)
      return res
        .status(400)
        .json({ message: "You have already claimed this listing" });

    const claim = await prisma.$transaction(async (tx) => {
      const createdClaim = await tx.claim.create({
        data: {
          listingId,
          claimerId: req.user.id,
        },
      });

      await tx.listing.update({
        where: { id: listingId },
        data: { status: "claimed" },
      });

      const minutesUntilPickupEnds = Math.max(
        0,
        Math.round((new Date(listing.pickupEnd).getTime() - Date.now()) / 60000),
      );

      await Promise.all([
        tx.notification.create({
          data: {
            userId: listing.donorId,
            type: "new_claim",
            title: "New claim!",
            message: `${req.user.name} just claimed ${listing.quantity} of ${listing.title} from your kitchen.`,
            actionLabel: "View Details",
            actionUrl: "/donor",
            relatedClaimId: createdClaim.id,
            relatedListingId: listing.id,
            metadata: {
              recipientRole: "donor",
              claimerId: req.user.id,
              claimerName: req.user.name,
              listingTitle: listing.title,
              quantity: listing.quantity,
            },
          },
        }),
        tx.notification.create({
          data: {
            userId: req.user.id,
            type: "pickup_reminder",
            title: "Pickup Reminder",
            message: `Reminder: Pick up your ${listing.title} from ${listing.address || listing.city || "the donor"} before the pickup window closes.`,
            actionLabel: "View Claim",
            actionUrl: `/claimer/claims/${createdClaim.id}`,
            relatedClaimId: createdClaim.id,
            relatedListingId: listing.id,
            metadata: {
              recipientRole: "claimer",
              donorId: listing.donorId,
              listingTitle: listing.title,
              quantity: listing.quantity,
              pickupEnd: listing.pickupEnd,
              minutesLeft: minutesUntilPickupEnds,
            },
          },
        }),
      ]);

      return createdClaim;
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error("Create Claim Error:", error);
    res.status(500).json({ message: "Server error creating claim" });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { claimerId: req.user.id },
      include: {
        listing: {
          include: {
            donor: {
              select: { id: true, name: true, email: true, city: true },
            },
          },
        },
      },
      orderBy: { claimedAt: "desc" },
    });
    res.json(claims);
  } catch (error) {
    console.error("Get My Claims Error:", error);
    res.status(500).json({ message: "Server error fetching your claims" });
  }
};

const getListingClaims = async (req, res) => {
  const { id: listingId } = req.params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.donorId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to view claims for this listing" });

    const claims = await prisma.claim.findMany({
      where: { listingId },
      include: {
        claimer: { select: { id: true, name: true, email: true, city: true } },
      },
      orderBy: { claimedAt: "desc" },
    });
    res.json(claims);
  } catch (error) {
    console.error("Get Listing Claims Error:", error);
    res.status(500).json({ message: "Server error fetching listing claims" });
  }
};

const getClaimById = async (req, res) => {
  const { id } = req.params;
  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                businessName: true,
                email: true,
                city: true,
                phoneNumber: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.claimerId !== req.user.id)
      return res.status(403).json({ message: "Not authorized to view this claim" });

    res.json(claim);
  } catch (error) {
    console.error("Get Claim By ID Error:", error);
    res.status(500).json({ message: "Server error fetching claim" });
  }
};

module.exports = { createClaim, getMyClaims, getListingClaims, getClaimById };

