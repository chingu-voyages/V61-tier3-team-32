import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Package,
  HandHeart,
  Leaf,
  Pencil,
  Trash2,
  Clock,
  Users,
  MapPin,
  Weight,
  UtensilsCrossed,
} from "lucide-react";
import { getMyListings, cancelListing } from "../lib/api";
import CancelListingModal from "../components/modals/CancelListingModal";
import { useAuth } from "../context/AuthContext";

const now = Date.now();

// ─── helpers ────────────────────────────────────────────────────────────────

function formatExpiry(expiresAt) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins <= 0) return "Expired";
  if (diffMins < 60) return `Expires in ${diffMins}m`;
  const hrs = Math.round(diffMins / 60);
  return `Expires in ${hrs}h`;
}

function isExpiringSoon(expiresAt) {
  if (!expiresAt) return false;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return diffMs > 0 && diffMs <= 60 * 60 * 1000; // within 1 hour
}

// ─── stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 min-w-0">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-primary mb-4">
        {icon}
      </div>
      <p className="text-3xl font-bold text-dark">{value}</p>
      <p className="text-sm text-mid-gray mt-1">{label}</p>
    </div>
  );
}

// ─── listing card ───────────────────────────────────────────────────────────

function ListingCard({ listing, onCancelClick }) {
  const isClaimed = listing.status === "claimed";
  const expiryLabel = formatExpiry(listing.expiresAt);
  const expiringSoon = isExpiringSoon(listing.expiresAt);

  const quantityIcon =
    listing.category === "Hot Meal" ? (
      <Users size={13} className="text-mid-gray shrink-0" />
    ) : listing.category === "Bakery" ? (
      <Package size={13} className="text-mid-gray shrink-0" />
    ) : (
      <Weight size={13} className="text-mid-gray shrink-0" />
    );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative h-44 bg-gray-100">
        {listing.photoUrl ? (
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}

        <span
          className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md ${
            isClaimed ? "bg-blue-500/90 text-white" : "bg-primary/90 text-white"
          }`}
        >
          {isClaimed ? "Claimed" : "Active"}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-dark leading-snug">{listing.title}</h3>
        </div>

        <div className="space-y-1.5">
          {listing.quantity && (
            <div className="flex items-center gap-1.5 text-sm text-mid-gray">
              {quantityIcon}
              <span>{listing.quantity}</span>
            </div>
          )}

          {expiryLabel && (
            <div className="flex items-center gap-1.5 text-xs">
              {isClaimed ? (
                <MapPin size={13} className="text-primary shrink-0" />
              ) : (
                <Clock
                  size={13}
                  className={
                    expiringSoon
                      ? "text-urgency shrink-0"
                      : "text-primary shrink-0"
                  }
                />
              )}
              <span
                className={`font-medium ${expiringSoon && !isClaimed ? "text-urgency font-medium" : "text-primary"}`}
              >
                {isClaimed ? "Ready for pickup" : expiryLabel}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          {isClaimed ? (
            <button className="flex-1 rounded-lg border border-primary py-2 text-sm font-medium text-primary hover:bg-gray-50 transition">
              View Details
            </button>
          ) : (
            <button className="flex-1 rounded-lg bg-blue-100 border border-blue-100 py-2 text-sm font-medium text-primary hover:bg-blue-200 transition">
              Edit Listing
            </button>
          )}
          <button
            onClick={() => onCancelClick(listing)}
            aria-label="Cancel listing"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:text-red-500 hover:border-red-200 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main dashboard ─────────────────────────────────────────────────────────

const FILTERS = ["All", "Active", "Claimed"];

export default function PosterDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await getMyListings();
        if (!cancelled) setListings(data);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Unable to load your listings");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancelClick = (listing) => {
    setSelectedListing(listing);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedListing) return;
    setIsCanceling(true);
    try {
      await cancelListing(selectedListing.id);
      setListings((prev) => prev.filter((l) => l.id !== selectedListing.id));
      setCancelModalOpen(false);
      setSelectedListing(null);
    } catch (err) {
      console.error("Failed to cancel listing:", err);
      alert("Failed to cancel listing. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleCloseModal = () => {
    if (!isCanceling) {
      setCancelModalOpen(false);
      setSelectedListing(null);
    }
  };

  const activeCount = listings.filter((l) => l.status === "active").length;

  const totalClaims = listings.filter((l) => l.status === "claimed").length;
  const mealsShared = listings.reduce((acc, l) => {
    const n = parseInt(l.quantity);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  const filteredListings = listings.filter((l) => {
    if (activeFilter === "Active") return l.status === "active";
    if (activeFilter === "Claimed") return l.status === "claimed";
    return true;
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[#F0F4F0]">
      <CancelListingModal
        isOpen={cancelModalOpen}
        listing={selectedListing}
        isLoading={isCanceling}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseModal}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Donor Dashboard
            </p>
            <h1 className="text-3xl font-extrabold text-dark tracking-tight">
              Welcome, {firstName} — manage your listings
            </h1>
            <p className="mt-1 text-mid-gray text-sm">
              Post surplus food from your kitchen and track who claims it.
            </p>
          </div>
          <Link
            to="/post"
            className="inline-flex items-center gap-2 bg-dark hover:bg-opacity-90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition whitespace-nowrap self-start"
          >
            <PlusCircle size={17} />
            Post new food
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<UtensilsCrossed size={18} className="text-primary" />}
            value={activeCount}
            label="Active listings"
          />
          <StatCard
            icon={<HandHeart size={18} className="text-primary" />}
            value={totalClaims}
            label="Total claims"
          />
          <StatCard
            icon={<Leaf size={18} className="text-primary" />}
            value={mealsShared}
            label="Meals shared"
          />
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-dark">Your listings</h2>

            {/* Filter tabs */}
            <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activeFilter === f
                      ? "bg-primary text-white shadow-sm"
                      : "text-mid-gray hover:text-dark"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <p className="text-mid-gray text-sm">Loading your listings…</p>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!isLoading && filteredListings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-dark font-semibold">No listings here yet</p>
              <p className="text-mid-gray text-sm mt-1">
                {activeFilter === "All"
                  ? "Post your first listing to get started."
                  : `You have no ${activeFilter.toLowerCase()} listings right now.`}
              </p>
              {activeFilter === "All" && (
                <Link
                  to="/post"
                  className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                >
                  <PlusCircle size={15} />
                  Post food now
                </Link>
              )}
            </div>
          )}

          {!isLoading && filteredListings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onCancelClick={handleCancelClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
