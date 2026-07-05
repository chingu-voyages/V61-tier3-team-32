import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getTimeLeftMinutes,
  formatTimeLeft,
  getUrgencyTier,
} from "../../lib/urgency";

const STATUS_CONFIG = {
  claimed: {
    badgeLabel: "Claimed",
    badgeClass: "bg-blue-500 text-white",
    buttonLabel: "Already Claimed",
    buttonClass: "bg-gray-200 text-mid-gray cursor-not-allowed",
  },
  completed: {
    badgeLabel: "Completed",
    badgeClass: "bg-gray-500 text-white",
    buttonLabel: "Completed",
    buttonClass: "bg-gray-200 text-mid-gray cursor-not-allowed",
  },
  expired: {
    badgeLabel: "Expired",
    badgeClass: "bg-danger text-white",
    buttonLabel: "No Longer Available",
    buttonClass: "bg-gray-200 text-mid-gray cursor-not-allowed",
  },
};

export default function ListingCard({ listing, onClaim }) {
  const navigate = useNavigate();
  const minutesLeft = getTimeLeftMinutes(listing.expiresAt);

  // A listing can be functionally expired (past its expiresAt) even if the
  // backend hasn't flipped status yet — treat both as "expired" on the card.
  const isPastExpiry = minutesLeft <= 0;
  const effectiveStatus =
    listing.status && listing.status !== "active"
      ? listing.status
      : isPastExpiry
        ? "expired"
        : "active";

  const isActive = effectiveStatus === "active";
  const statusInfo = STATUS_CONFIG[effectiveStatus];

  const timeLabel = formatTimeLeft(minutesLeft);
  const urgency = getUrgencyTier(minutesLeft);

  const badgeLabel = isActive ? timeLabel : statusInfo.badgeLabel;
  const badgeClass = isActive ? urgency.badgeClass : statusInfo.badgeClass;
  const buttonLabel = isActive ? urgency.buttonLabel : statusInfo.buttonLabel;
  const buttonClass = isActive ? urgency.buttonClass : statusInfo.buttonClass;

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm ${
        !isActive ? "opacity-75" : ""
      }`}
    >
      <div className="relative h-44">
        {listing.photoUrl ? (
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className={`h-full w-full object-cover ${!isActive ? "grayscale" : ""}`}
          />
        ) : (
          <div className="h-full w-full bg-light-gray" />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-dark">
          {listing.category || "Food"}
        </span>
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {badgeLabel}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-bold text-dark">{listing.title}</h4>
          <button
            onClick={() => navigate(`/donor/${listing.donorId}`)}
            className="text-xs text-primary hover:underline font-medium transition"
          >
            {listing.donor?.name}
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs text-mid-gray">
          <MapPin className="h-4 w-4" />
          {listing.distanceKm != null
            ? `${listing.distanceKm.toFixed(1)} km`
            : listing.address
              ? listing.address
              : "Distance unknown"}
        </div>

        <button
          type="button"
          disabled={!isActive}
          onClick={() => isActive && onClaim(listing)}
          className={`w-full rounded-lg py-2.5 font-semibold transition ${buttonClass}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}