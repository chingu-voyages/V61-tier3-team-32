import { useEffect, useState } from "react";
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
import { NIGERIAN_CITIES } from "../../constants/locations";

const STATUS_DISPLAY = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800",
  },
  no_show: {
    label: "No Show",
    className: "bg-red-100 text-red-800",
  },
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

// Helper: Get user's location (saved or browser)
const resolveCoords = async (user) => {
  // If user has saved coordinates, use them
  if (user?.latitude != null && user?.longitude != null) {
    return { lat: user.latitude, lng: user.longitude };
  }

  // Otherwise try browser geolocation
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => resolve({}),
      { timeout: 3000, enableHighAccuracy: false },
    );
  });
};

// Main Dashboard Component
export default function ClaimerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    mealsRescued: 0,
    nearbyListings: 0,
    activeClaims: 0,
  });
  const [claims, setClaims] = useState([]);
  const [feedListings, setFeedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [justClaimed, setJustClaimed] = useState(false);
  const [claimedListingId, setClaimedListingId] = useState(null);
  const [viewingClaim, setViewingClaim] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Get user's location
        const coords = await resolveCoords(user);

        // Fetch listings and claims in parallel
        const listingsQuery = { status: "active", limit: 6 };
        if (cityFilter !== "all") {
          listingsQuery.city = cityFilter;
        }

        const [listingsRes, claimsRes] = await Promise.all([
          getListings(listingsQuery),
          getMyClaims().catch(() => ({ data: [] })), // Don't fail if no claims yet
        ]);

        if (cancelled) return;

        const listings = listingsRes.data.listings || [];
        const claimsData = claimsRes.data || [];

        // Calculate stats
        const activeClaims = claimsData.filter(
          (claim) => claim.status === "pending",
        ).length;

        const completedClaims = claimsData.filter(
          (claim) => claim.status === "confirmed",
        ).length;

        setStats({
          mealsRescued: completedClaims,
          nearbyListings: listings.length,
          activeClaims: activeClaims,
        });

        setFeedListings(listings);
        setClaims(claimsData);
      } catch (err) {
        console.error("Failed to load claimer dashboard:", err);
        if (!cancelled) {
          setError("Unable to load listings. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user, cityFilter]);

  // Handle claiming a listing
  const handleConfirmClaim = async (listing) => {
    setIsClaiming(true);
    setClaimError("");
    setJustClaimed(false);

    try {
      await claimListing(listing.id);

      // Success - show the success state
      setJustClaimed(true);
      setClaimedListingId(listing.id);

      // Update the feed: remove the claimed listing
      setFeedListings((prev) => prev.filter((l) => l.id !== listing.id));

      // Update stats
      setStats((prev) => ({
        ...prev,
        activeClaims: prev.activeClaims + 1,
        nearbyListings: Math.max(0, prev.nearbyListings - 1),
      }));

      // Refresh claims
      try {
        const { data: updatedClaims } = await getMyClaims();
        setClaims(updatedClaims || []);
      } catch (e) {
        // Don't fail if claims refresh fails
        console.warn("Could not refresh claims", e);
      }

      // Close modal after a moment
      setTimeout(() => {
        setSelectedListing(null);
        setJustClaimed(false);
        setClaimedListingId(null);
      }, 2500);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not claim this listing. Please try again.";
      setClaimError(message);
      setJustClaimed(false);
    } finally {
      setIsClaiming(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "User";

  const filteredClaims = claims.filter(
    (claim) => statusFilter === "all" || claim.status === statusFilter
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h2 className="text-3xl font-bold text-dark">
          Welcome back, {firstName}! 👋
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark">Live Feed Near You</h3>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-dark font-medium"
          >
            <option value="all">All Locations</option>
            {NIGERIAN_CITIES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : feedListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-mid-gray">
              No listings available for the selected location right now.
            </p>
            <p className="text-sm text-mid-gray mt-2">
              Check back later or expand your search area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedListings.slice(0, 6).map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClaim={setSelectedListing}
              />
            ))}
          </div>
        )}
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-dark">Recent Claims</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-dark font-medium"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-mid-gray">You haven't claimed any food yet.</p>
              <p className="text-sm text-mid-gray mt-2">
                Browse the live feed above to rescue your first meal!
              </p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-mid-gray">No claims found for this state.</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[400px]">
              <thead className="bg-light-gray text-mid-gray">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Item</th>
                  <th className="text-left font-medium px-4 py-3">Donor</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="text-right font-medium px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.slice(0, 5).map((claim) => {
                  const status = STATUS_DISPLAY[claim.status] || {
                    label: claim.status,
                    className: "bg-gray-100 text-gray-700",
                  };

                  return (
                    <tr
                      key={claim.id}
                      className="border-t border-gray-100 hover:bg-gray-50/50 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-dark">
                        {claim.listing?.title || "Unknown Item"}
                      </td>
                      <td className="px-4 py-3 text-mid-gray">
                        {claim.listing?.donor?.name || "Unknown Donor"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-mid-gray text-xs">
                        {new Date(claim.claimedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingClaim(claim)}
                          className="text-primary font-medium hover:underline text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Claim Error Toast */}
      {claimError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-100 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-lg z-50">
          <p className="text-sm font-medium">{claimError}</p>
        </div>
      )}

      {/* Listing Details Modal */}
      <ListingDetailsModal
        listing={selectedListing}
        onClose={() => {
          setSelectedListing(null);
          setJustClaimed(false);
          setClaimedListingId(null);
          setClaimError("");
        }}
        onConfirm={handleConfirmClaim}
        isSubmitting={isClaiming}
        claimed={justClaimed}
        error={claimError}
      />

      <ListingDetailsModal
        listing={viewingClaim?.listing}
        onClose={() => setViewingClaim(null)}
        viewOnly
        claimStatus={viewingClaim?.status}
      />
    </div>
  );
}
