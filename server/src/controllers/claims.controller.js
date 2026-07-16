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
        Math.round(
          (new Date(listing.pickupEnd).getTime() - Date.now()) / 60000,
        ),
      );

      await Promise.all([
        tx.notification.create({
          data: {
            userId: listing.donorId,
            type: "new_claim",
            title: "New claim!",
            message: `${req.user.name} just claimed ${listing.quantity} of ${listing.title} from your kitchen.`,
            actionLabel: "View Details",
            actionUrl: `/donor/claims/${createdClaim.id}`,
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

// For donors — view a claim on their own listing
const getClaimDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        listing: true,
        claimer: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            city: true,
          },
        },
      },
    });

    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.listing.donorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this claim" });
    }
    res.json(claim);
  } catch (error) {
    console.error("Get Claim Details Error:", error);
    res.status(500).json({ message: "Server error fetching claim details" });
  }
};

// For claimers — view their own claim with full listing + donor info
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

const confirmClaim = async (req, res) => {
  const { id } = req.params;
  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        listing: true,
        claimer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.listing.donorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to confirm this claim" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Claim has already been ${claim.status}` });
    }

    const [updated] = await prisma.$transaction([
      prisma.claim.update({
        where: { id },
        data: { status: "confirmed" },
      }),
      prisma.notification.create({
        data: {
          userId: claim.claimerId,
          type: "general",
          title: "Claim confirmed!",
          message: `${req.user.businessName || req.user.name} has confirmed your claim for "${claim.listing.title}". The donor will send pickup details soon.`,
          actionLabel: "View Claim",
          actionUrl: `/claimer/claims/${claim.id}`,
          relatedClaimId: claim.id,
          relatedListingId: claim.listingId,
          metadata: {
            recipientRole: "claimer",
            donorId: req.user.id,
            donorName: req.user.name,
            listingTitle: claim.listing.title,
            confirmedAt: new Date().toISOString(),
          },
        },
      }),
    ]);

    res.json(updated);
  } catch (error) {
    console.error("Confirm Claim Error:", error);
    res.status(500).json({ message: "Server error confirming claim" });
  }
};

const declineClaim = async (req, res) => {
  const { id } = req.params;
  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.listing.donorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to decline this claim" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Claim has already been ${claim.status}` });
    }

    // Declining frees the listing back up so someone else can claim it, and
    // lets the claimer know so they don't keep waiting on a dead claim.
    const [updatedClaim] = await prisma.$transaction([
      prisma.claim.update({ where: { id }, data: { status: "declined" } }),
      prisma.listing.update({
        where: { id: claim.listingId },
        data: { status: "active" },
      }),
      prisma.notification.create({
        data: {
          userId: claim.claimerId,
          type: "general",
          title: "Claim declined",
          message: `Your claim on "${claim.listing.title}" wasn't confirmed by the donor. The listing is back up for others to claim.`,
          actionLabel: "Browse Listings",
          actionUrl: "/claimer",
          relatedClaimId: claim.id,
          relatedListingId: claim.listingId,
          metadata: {
            recipientRole: "claimer",
            listingTitle: claim.listing.title,
          },
        },
      }),
    ]);

    res.json(updatedClaim);
  } catch (error) {
    console.error("Decline Claim Error:", error);
    res.status(500).json({ message: "Server error declining claim" });
  }
};

const sendPickupDetails = async (req, res) => {
  const { id } = req.params;
  const { pickupAddress, contactEmail, contactPhone } = req.body;

  if (!pickupAddress || !pickupAddress.trim()) {
    return res.status(400).json({ message: "Pickup address is required" });
  }
  if (!contactEmail || !contactEmail.includes("@")) {
    return res
      .status(400)
      .json({ message: "A valid contact email is required" });
  }

  try {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.listing.donorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this claim" });
    }
    if (claim.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed claims can have pickup details sent",
      });
    }

    const [updated] = await prisma.$transaction([
      prisma.claim.update({
        where: { id },
        data: {
          pickupAddress: pickupAddress.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone?.trim() || null,
          detailsSentAt: new Date(),
        },
      }),
      prisma.notification.create({
        data: {
          userId: claim.claimerId,
          type: "general",
          title: "Pickup details ready",
          message: `${req.user.businessName || req.user.name} sent you pickup details for "${claim.listing.title}". Head over to collect it.`,
          actionLabel: "View Pickup Details",
          actionUrl: `/claimer/claims/${claim.id}`,
          relatedClaimId: claim.id,
          relatedListingId: claim.listingId,
          metadata: {
            recipientRole: "claimer",
            pickupAddress: pickupAddress.trim(),
            contactEmail: contactEmail.trim(),
            contactPhone: contactPhone?.trim() || null,
          },
        },
      }),
    ]);

    res.json(updated);
  } catch (error) {
    console.error("Send Pickup Details Error:", error);
    res.status(500).json({ message: "Server error sending pickup details" });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getListingClaims,
  getClaimDetails,
  getClaimById,
  confirmClaim,
  declineClaim,
  sendPickupDetails,
};
