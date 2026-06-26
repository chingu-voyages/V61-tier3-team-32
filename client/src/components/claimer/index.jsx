import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  Bell,
  TrendingUp,
  Package,
  Users,
  Calendar,
  UtensilsCrossed,
  ScrollText,
  AlertTriangle,
} from "lucide-react";

import ListingDetailsModal from "./ListingDetailsModal";
import ListingCard from "./ListingCard";

import { getListings, claimListing, getMyClaims } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Dummy data for the live feed
const DUMMY_FEED_LISTINGS = [
  {
    id: 1,
    title: "Fresh Bakery Items",
    description: "Assorted breads and pastries from this morning's batch",
    quantity: 15,
    unit: "pieces",
    expiryTime: "2026-06-26T18:00:00Z",
    distance: 0.8,
    donor: {
      id: 1,
      name: "Sunrise Bakery",
      address: "123 Main St",
      rating: 4.8,
    },
    photoUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    status: "available",
  },
  {
    id: 2,
    title: "Vegetable Surplus",
    description: "Fresh organic vegetables from local farm",
    quantity: 25,
    unit: "kg",
    expiryTime: "2026-06-27T12:00:00Z",
    distance: 1.2,
    donor: {
      id: 2,
      name: "Green Valley Farm",
      address: "456 Oak Ave",
      rating: 4.9,
    },
    photoUrl:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
    status: "available",
  },
  {
    id: 3,
    title: "Dairy Products",
    description: "Milk, yogurt, and cheese nearing best before date",
    quantity: 10,
    unit: "liters",
    expiryTime: "2026-06-26T22:00:00Z",
    distance: 2.1,
    donor: {
      id: 3,
      name: "Daily Fresh Dairy",
      address: "789 Pine St",
      rating: 4.7,
    },
    photoUrl:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
    status: "available",
  },
];

// Dummy data for recent claims
const DUMMY_RECENT_CLAIMS = [
  {
    id: 1,
    status: "pending",
    createdAt: "2026-06-25T14:30:00Z",
    listing: {
      id: 101,
      title: "Fresh Fruit Basket",
      donor: {
        id: 4,
        name: "Organic Market",
      },
    },
  },
  {
    id: 2,
    status: "confirmed",
    createdAt: "2026-06-24T10:15:00Z",
    listing: {
      id: 102,
      title: "Bread and Pastries",
      donor: {
        id: 1,
        name: "Sunrise Bakery",
      },
    },
  },
  {
    id: 3,
    status: "pending",
    createdAt: "2026-06-24T09:00:00Z",
    listing: {
      id: 103,
      title: "Vegetable Medley",
      donor: {
        id: 2,
        name: "Green Valley Farm",
      },
    },
  },
  {
    id: 4,
    status: "no_show",
    createdAt: "2026-06-23T16:45:00Z",
    listing: {
      id: 104,
      title: "Dairy Products",
      donor: {
        id: 3,
        name: "Daily Fresh Dairy",
      },
    },
  },
];

const STATUS_DISPLAY = {
  pending: {
    label: "Ready for Pickup",
    className: "bg-primary-light text-primary",
  },
  confirmed: { label: "Completed", className: "bg-gray-200 text-mid-gray" },
  no_show: { label: "Missed", className: "bg-red-100 text-danger" },
};

const StatCard = ({
  icon,
  label,
  value,
  bgColor = "bg-green-50",
  textColor = "text-green-700",
}) => (
  <div className="bg-white rounded-2xl py-4 px-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor} ${textColor}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
export default function ClaimerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    mealsRescued: 12,
    nearbyListings: 0,
    activeClaims: 0,
  });
  const [claims, setClaims] = useState([]);
  const [feedListings, setFeedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Prefer the user's saved coordinates; fall back to browser
      // geolocation if they haven't set one, so the feed can still sort
      // by distance for a first-time user.
      let statsData, claimsData, feedData;

      claimsData = DUMMY_RECENT_CLAIMS;
      feedData = DUMMY_FEED_LISTINGS;

      setClaims(claimsData);
      setFeedListings(feedData);

      return;
      const coords = await resolveCoords(user);
      try {
        const [statsRes, claimsRes, feedRes] = await Promise.all([
          api.get("/stats/claimer"),
          api.get("/claims/mine"),
          api.get("/listings", { params: { ...coords, limit: 3 } }),
        ]);
        statsData = statsRes.data;
        claimsData = claimsRes.data;
        feedData = feedRes.data;
      } catch (err) {
        console.error("Failed to load claimer dashboard:", err);
        statsData = DUMMY_STATS;
        claimsData = DUMMY_RECENT_CLAIMS;
        feedData = DUMMY_FEED_LISTINGS;
      } finally {
        if (!cancelled) setIsLoading(false);
      }
      if (cancelled) return;
      setStats(statsData);
      setClaims(claimsData);
      setFeedListings(feedData);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleConfirmClaim = async (listing) => {
    setIsClaiming(true);
    setClaimError("");
    try {
      await api.post(`/listings/${listing.id}/claim`);
      setSelectedListing(null);
      setFeedListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      setClaimError(
        err?.response?.data?.message ||
          "Could not claim this listing. Please try again.",
      );
    } finally {
      setIsClaiming(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h2 className="text-3xl font-bold text-dark">
          Welcome back, {firstName}!
        </h2>
        <p className="mt-1 text-mid-gray">Ready to rescue some food today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<UtensilsCrossed size={24} />}
          label="Meals Rescued"
          value={stats.mealsRescued}
          bgColor="bg-green-50"
          textColor="text-green-700"
        />
        <StatCard
          icon={<MapPin size={24} />}
          label="Nearby Listings"
          value={stats.nearbyListings}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
        />
        <StatCard
          icon={<ScrollText size={24} />}
          label="Active Claims"
          value={stats.activeClaims}
          bgColor="bg-orange-50"
          textColor="text-orange-700"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark">Live Feed Near You</h3>
          <Link
            to="/claimer/feed"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!isLoading && feedListings.length === 0 && (
            <p className="text-mid-gray sm:col-span-3">
              No listings near you right now.
            </p>
          )}
          {feedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClaim={setSelectedListing}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-urgency/30 bg-urgency/10 p-5">
        <AlertTriangle className="h-5 w-5 text-urgency mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-dark">Important Pickup Reminder</h3>
          <p className="mt-1 text-sm text-mid-gray">
            You are claiming a surplus item. Please collect this item before the
            listed expiry time. If the item looks, smells, or feels unsafe when
            you arrive to pick it up, do not collect or consume it, and leave a
            rating reflecting your experience to inform the community.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-dark mb-3">Recent Claims</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-light-gray text-mid-gray">
              <tr>
                <th className="text-left font-medium px-4 py-3">Item</th>
                <th className="text-left font-medium px-4 py-3">Donor</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && claims.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-mid-gray"
                  >
                    You have not claimed anything yet.
                  </td>
                </tr>
              )}
              {claims.map((claim) => {
                const status = STATUS_DISPLAY[claim.status] ?? {
                  label: claim.status,
                  className: "bg-gray-200 text-mid-gray",
                };
                return (
                  <tr key={claim.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-dark">
                      {claim.listing?.title}
                    </td>
                    <td className="px-4 py-3 text-mid-gray">
                      {claim.listing?.donor?.name}
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/listings/${claim.listingId}`}
                        className="text-primary font-medium hover:underline"
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {claimError && (
        <p role="alert" className="text-sm text-danger">
          {claimError}
        </p>
      )}
    </div>
  );
}

// Tries the user's saved coordinates first since they're already on the
// User record; falls back to a one-shot browser geolocation prompt so the
// "near you" sort still works before a user has set a location.
function resolveCoords(user) {
  if (user?.latitude != null && user?.longitude != null) {
    return Promise.resolve({ lat: user.latitude, lng: user.longitude });
  }
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { timeout: 3000 },
    );
  });
}
