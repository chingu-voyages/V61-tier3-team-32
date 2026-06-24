import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function CancelListingModal({ isOpen, listing, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cancel sharing</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to cancel sharing this listing? This action cannot be undone.
          </p>
          {listing && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Listing details:</p>
              <p className="font-semibold text-gray-900 mt-1">{listing.title}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {listing.category}
                </span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {listing.quantity}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep sharing
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
