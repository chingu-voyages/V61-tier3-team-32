import React from 'react';
import { X, MapPin, Clock, Users, AlertCircle, Edit, Trash2, Calendar, Home } from 'lucide-react';

export default function ListingDetailsModal({
  isOpen,
  listing,
  onClose,
  onEditClick,
  onCancelClick,
  isLoading,
}) {
  if (!isOpen || !listing) return null;

  const isClaimed = listing.status === 'claimed';
  const categoryLabel =
    listing.category === 'Hot Meal'
      ? 'Hot Meal'
      : listing.category === 'Bakery'
        ? 'Bakery'
        : listing.category || 'Other';

  const formatTime = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPickupWindow = () => {
    if (!listing.pickupStart || !listing.pickupEnd) return null;
    const startTime = formatTime(listing.pickupStart);
    const endTime = formatTime(listing.pickupEnd);
    
    // Check if it's today
    const today = new Date();
    const startDate = new Date(listing.pickupStart);
    const isToday = today.toDateString() === startDate.toDateString();
    
    return isToday ? `${startTime} - ${endTime} today` : `${startTime} - ${endTime}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50 px-4 py-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 max-h-[calc(100vh-2rem)]">
        
        {/* Image Section with Title Overlay */}
        <div className="relative h-72 bg-gray-200 overflow-hidden">
          {listing.photoUrl ? (
            <img
              src={listing.photoUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 z-10 shadow-md"
          >
            <X size={20} />
          </button>

          {/* Status Badge */}
          <span className="absolute top-4 left-4 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1">
            ◆ {isClaimed ? 'CLAIMED' : 'ACTIVE'}
          </span>

          {/* Category Badge - positioned below status */}
          {listing.category && (
            <div className="absolute top-12 left-4 flex items-center gap-2 bg-white/90 text-dark px-2.5 py-1 rounded-md">
              <X size={14} className="font-bold" />
              <span className="text-xs font-medium">{categoryLabel}</span>
            </div>
          )}

          {/* Title Overlay - bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white">{listing.title}</h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-25rem)]">
          {/* Details Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 rounded-2xl p-6">
            {/* Quantity */}
            {listing.quantity && (
              <div className="flex flex-col">
                <p className="text-xs font-bold text-mid-gray uppercase tracking-widest mb-3">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Users size={20} className="text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-dark">
                    {listing.quantity}
                  </p>
                </div>
              </div>
            )}

            {/* City/Location */}
            {listing.city && (
              <div className="flex flex-col">
                <p className="text-xs font-bold text-mid-gray uppercase tracking-widest mb-3">
                  Location
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin size={20} className="text-blue-500" />
                  </div>
                  <p className="text-lg font-semibold text-dark">{listing.city}</p>
                </div>
              </div>
            )}

            {/* Pickup Window */}
            {formatPickupWindow() && (
              <div className="flex flex-col">
                <p className="text-xs font-bold text-mid-gray uppercase tracking-widest mb-3">
                  Pickup Window
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock size={20} className="text-orange-500" />
                  </div>
                  <p className="text-lg font-semibold text-dark">
                    {formatPickupWindow()}
                  </p>
                </div>
              </div>
            )}

            {/* Kitchen / Business Name */}
            {listing.donor?.name && (
              <div className="flex flex-col">
                <p className="text-xs font-bold text-mid-gray uppercase tracking-widest mb-3">
                  Kitchen / Business
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Home size={20} className="text-purple-500" />
                  </div>
                  <p className="text-lg font-semibold text-dark">
                    {listing.donor.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {listing.description && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-2">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-yellow-700 shrink-0 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    Notes for the claimer
                  </p>
                  <p className="text-sm text-yellow-900">{listing.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 md:p-8 bg-white flex gap-3">
          <button
            onClick={() => onCancelClick(listing)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Cancel Listing
          </button>
          <button
            onClick={() => onEditClick(listing)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit size={16} />
            Edit Listing
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-dark font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
