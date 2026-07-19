import { Link } from "react-router-dom";
import {
  X,
  Users,
  MapPin,
  Clock,
  FileText,
  BadgeCheck,
  ChevronRight,
  Store,
  ArrowRight,
  ShieldX,
} from "lucide-react";

import { formatTimeLeft, getTimeLeftMinutes } from "../../lib/urgency";

const CLAIM_STATUS_DISPLAY = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
  no_show: { label: "No Show", className: "bg-red-100 text-red-800" },
};

export default function ListingDetailsModal({
  listing,
  onClose,
  onConfirm,
  isSubmitting,
  claimed,
  viewOnly = false,
  claimStatus,
}) {
  if (!listing) return null;

  const minutesLeft = getTimeLeftMinutes(
    listing.expiresAt ?? listing.expiryTime,
  );

  const isExpired = listing.status === 'expired' || (listing.expiresAt && new Date(listing.expiresAt).getTime() <= Date.now());

  const formatWindowTime = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const pickupWindow =
    listing.pickupStart && listing.pickupEnd
      ? `${formatWindowTime(listing.pickupStart)} – ${formatWindowTime(listing.pickupEnd)}`
      : listing.expiresAt
        ? `Before ${formatWindowTime(listing.expiresAt)}`
        : "—";

  const location = listing.city ?? listing.donor?.address ?? "—";
  const quantity = listing.quantity
    ? `${listing.quantity}${listing.unit ? ` ${listing.unit}` : ""}`
    : "—";

  const donorName = listing.donor?.name ?? listing.kitchen ?? "Donor";
  const isVerified = listing.donor?.rating != null || listing.verified;
  const postedAgo = listing.createdAt
    ? (() => {
      const diff = Math.round(
        (Date.now() - new Date(listing.createdAt)) / 60000,
      );
      if (diff < 60) return `${diff} minute${diff !== 1 ? "s" : ""} ago`;
      const h = Math.round(diff / 60);
      return `${h} hour${h !== 1 ? "s" : ""} ago`;
    })()
    : null;

  const statusBadge = viewOnly
    ? CLAIM_STATUS_DISPLAY[claimStatus] || {
      label: claimStatus || "Active",
      className: "bg-primary text-white",
    }
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-shrink-0">
          {listing.photoUrl ? (
            <img
              src={listing.photoUrl}
              alt={listing.title}
              className="w-full h-36 md:h-56 object-cover"
            />
          ) : (
            <div className="w-full h-36 md:h-56 bg-light-gray" />
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {viewOnly ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            ) : (
              <span className={`rounded-full ${isExpired ? 'bg-red-500' : 'bg-primary'} px-3 py-1 text-xs font-bold text-white uppercase tracking-wide shadow`}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            )}
            {listing.category && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-dark shadow">
                {listing.category}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark shadow hover:bg-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="sm:text-xl font-bold text-dark leading-tight">
                {listing.title}
              </h2>
              <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-mid-gray">
                <Store className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{donorName}</span>
              </div>
              {listing.businessName ? <p>{listing.businessName}</p> : null}
            </div>
            {listing.donorId && (
              <Link
                to={`/donor/${listing.donorId}`}
                className="flex-shrink-0 flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline whitespace-nowrap"
              >
                View profile <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="px-6 pb-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoTile
              icon={<Users className="h-5 w-5 text-primary" />}
              label="QUANTITY"
              value={quantity}
            />
            <InfoTile
              icon={<MapPin className="h-5 w-5 text-primary" />}
              label="LOCATION"
              value={location}
            />
            <InfoTile
              icon={<Clock className="h-5 w-5 text-primary" />}
              label="PICKUP WINDOW"
              value={pickupWindow}
            />
          </div>

          {listing.description && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-primary">
                  Notes for the claimer
                </h3>
              </div>
              <div className="rounded-md bg-light-gray px-4 py-3 text-sm leading-relaxed">
                {listing.description}
              </div>
            </div>
          )}

          <div className="px-6 pb-5 flex flex-col xs:flex-row xs:items-center justify-end gap-2">
            {postedAgo && (
              <span className="text-xs text-mid-gray">Posted {postedAgo}</span>
            )}
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex-shrink-0 border-t border-gray-100">
          {viewOnly ? (
            // Read-only footer: just a close button, no claim action
            <div className="flex px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 bg-white text-dark font-bold py-3 hover:bg-light-gray transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {claimed && (
                <div className="flex items-center gap-2 px-5 py-3 bg-primary-light text-primary text-xs">
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16v-4m0-4h.01"
                    />
                  </svg>
                  The donor has been notified of your claim. Please wait for the
                  donor to approve your request.
                </div>
              )}

              <div className="flex flex-col xs:flex-row gap-3 px-5 py-4">
                <button
                  type="button"
                  disabled={isSubmitting || claimed}
                  onClick={() => onConfirm(listing)}
                  className="flex-1 flex items-center justify-center text-xs sm:text-sm gap-2 rounded-xl bg-primary hover:bg-accent disabled:opacity-60 text-white py-3 font-bold transition"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isSubmitting
                    ? "Claiming..."
                    : claimed
                      ? "Claimed!"
                      : "Claim this food"}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-dark font-bold py-3 hover:bg-light-gray transition"
                >
                  Cancel
                </button>
              </div>

              {!claimed && (
                <div className="hidden xs:flex items-start gap-2 mx-5 mb-4 rounded-xl bg-[#F0F7FF] px-4 py-3 text-xs text-[#3B7DD8]">
                  <svg
                    className="h-4 w-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16v-4m0-4h.01"
                    />
                  </svg>
                  The donor would be notified of your claim. Please wait for the
                  donor to approve your request.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
      {icon}
      <p className="text-[8px] font-bold tracking-wider text-mid-gray uppercase">
        {label}
      </p>
      <p className="text-xs font-bold text-dark leading-tight">{value}</p>
    </div>
  );
}
