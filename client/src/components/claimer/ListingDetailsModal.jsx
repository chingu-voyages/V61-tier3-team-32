import { X } from "lucide-react";

import { formatTimeLeft, getTimeLeftMinutes } from "../../lib/urgency";

export default function ListingDetailsModal({
  listing,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  if (!listing) return null;
  const minutesLeft = getTimeLeftMinutes(listing.expiresAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-dark">{listing.title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-mid-gray hover:text-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1 text-sm text-mid-gray">{listing.donor?.name}</p>

        {listing.photoUrl && (
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className="mt-4 h-40 w-full rounded-xl object-cover"
          />
        )}

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-mid-gray">Quantity</dt>
            <dd className="font-medium text-dark">{listing.quantity}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mid-gray">Time left</dt>
            <dd className="font-medium text-dark">
              {formatTimeLeft(minutesLeft)}
            </dd>
          </div>
          {listing.address && (
            <div className="flex justify-between">
              <dt className="text-mid-gray">Pickup address</dt>
              <dd className="font-medium text-dark text-right">
                {listing.address}
              </dd>
            </div>
          )}
        </dl>

        {listing.description && (
          <p className="mt-4 text-sm text-dark">{listing.description}</p>
        )}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onConfirm(listing)}
          className="mt-6 w-full rounded-lg bg-primary hover:bg-accent disabled:opacity-60 text-white py-2.5 font-semibold transition"
        >
          {isSubmitting ? "Claiming..." : "Confirm Claim"}
        </button>
      </div>
    </div>
  );
}
