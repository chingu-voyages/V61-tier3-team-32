import { Package, Trash2, Clock, Users, MapPin, Weight } from "lucide-react";

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

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() - Date.now() <= 0;
}

const ListingCard = ({ listing, onCancelClick }) => {
  const isClaimed = listing.status === "claimed";
  const expired = isExpired(listing.expiresAt);
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
            isClaimed
              ? "bg-blue-500/90 text-white"
              : expired
                ? "bg-red-500/90 text-white"
                : "bg-primary/90 text-white"
          }`}
        >
          {isClaimed ? "Claimed" : expired ? "Expired" : "Active"}
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
                    expired
                      ? "text-red-500 shrink-0"
                      : expiringSoon
                        ? "text-urgency shrink-0"
                        : "text-primary shrink-0"
                  }
                />
              )}

              <span
                className={`font-medium ${
                  isClaimed
                    ? "text-primary"
                    : expired
                      ? "text-red-500"
                      : expiringSoon
                        ? "text-urgency"
                        : "text-primary"
                }`}
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
};

export default ListingCard;
