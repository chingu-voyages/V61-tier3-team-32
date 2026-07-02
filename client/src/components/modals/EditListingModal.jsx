import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { updateListing } from '../../lib/api';

export default function EditListingModal({ isOpen, listing, onClose, onSuccess, isLoading }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Hot Meal',
    quantity: '',
    description: '',
    address: '',
    pickupStart: '',
    pickupEnd: '',
    expiresAt: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || '',
        category: listing.category || 'Hot Meal',
        quantity: listing.quantity || '',
        description: listing.description || '',
        address: listing.address || '',
        pickupStart: listing.pickupStart ? new Date(listing.pickupStart).toISOString().slice(0, 16) : '',
        pickupEnd: listing.pickupEnd ? new Date(listing.pickupEnd).toISOString().slice(0, 16) : '',
        expiresAt: listing.expiresAt ? new Date(listing.expiresAt).toISOString().slice(0, 16) : '',
      });
    }
  }, [listing, isOpen]);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!form.quantity.trim()) {
      setError('Quantity is required');
      return;
    }

    if (!form.pickupStart) {
      setError('Pickup start time is required');
      return;
    }

    if (!form.pickupEnd) {
      setError('Pickup end time is required');
      return;
    }

    if (!form.expiresAt) {
      setError('Expiry time is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        title: form.title,
        category: form.category,
        quantity: form.quantity,
        description: form.description,
        address: form.address,
        pickupStart: new Date(form.pickupStart),
        pickupEnd: new Date(form.pickupEnd),
        expiresAt: new Date(form.expiresAt),
      };

      await updateListing(listing.id, updateData);
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Failed to update listing. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50 px-4 py-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-dark">Edit Listing</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-20rem)]">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-dark mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={updateField('title')}
                placeholder="e.g., Jollof Rice"
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-dark mb-2">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={updateField('category')}
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              >
                <option value="Hot Meal">Hot Meal</option>
                <option value="Bakery">Bakery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-dark mb-2">
                Quantity *
              </label>
              <input
                id="quantity"
                type="text"
                value={form.quantity}
                onChange={updateField('quantity')}
                placeholder="e.g., Serves 4, 12 items, 5kg"
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-dark mb-2">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={updateField('address')}
                placeholder="Street address"
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            {/* Pickup Start */}
            <div>
              <label htmlFor="pickupStart" className="block text-sm font-medium text-dark mb-2">
                Pickup Start *
              </label>
              <input
                id="pickupStart"
                type="datetime-local"
                value={form.pickupStart}
                onChange={updateField('pickupStart')}
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            {/* Pickup End */}
            <div>
              <label htmlFor="pickupEnd" className="block text-sm font-medium text-dark mb-2">
                Pickup End *
              </label>
              <input
                id="pickupEnd"
                type="datetime-local"
                value={form.pickupEnd}
                onChange={updateField('pickupEnd')}
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            {/* Expires At */}
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-dark mb-2">
                Expiry Time *
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={updateField('expiresAt')}
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dark mb-2">
                Notes for Claimer
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={updateField('description')}
                placeholder="Any special instructions or allergen information"
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-dark font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
