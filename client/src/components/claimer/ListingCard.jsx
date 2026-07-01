import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getTimeLeftMinutes, formatTimeLeft, getUrgencyTier } from "../../lib/urgency";

export default function ListingCard({ listing, onClaim }) {
  const navigate = useNavigate();
  const minutesLeft = getTimeLeftMinutes(listing.expiresAt);
  const timeLabel = formatTimeLeft(minutesLeft);
  const urgency = getUrgencyTier(minutesLeft);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="relative h-44">
        {listing.photoUrl ? (
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-light-gray" />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-dark">
          {listing.category || "Food"}
        </span>
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${urgency.badgeClass}`}
        >
          {timeLabel}
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
          {listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km` : "Distance unknown"}
        </div>

        <button
          type="button"
          onClick={() => onClaim(listing)}
          className={`w-full rounded-lg py-2.5 font-semibold transition ${urgency.buttonClass}`}
        >
          {urgency.buttonLabel}
        </button>
      </div>
    </div>
  );
}