import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function CancelListingModal({ isOpen, listing, onConfirm, onCancel, isLoading }) {
  if (!isOpen || !listing) return null;

  const transactionId = listing.id.slice(0, 8).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50 px-4 py-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header with colored background */}
        <div className="bg-red-100 px-6 py-8 flex flex-col items-center justify-center">
          <div className="bg-red-600 rounded-full p-3 mb-4">
            <AlertCircle className="text-white" size={28} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Cancel Listing</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-8">
            Are you sure you want to cancel this listing? This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Canceling...
                </>
              ) : (
                'Yes, cancel'
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-dark font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              No, keep listing
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
            <span>🔒</span>
            Secure Transaction ID: {transactionId}
          </p>
        </div>
      </div>
    </div>
  );
}
