import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createListing, uploadListingPhoto } from '../../lib/api';
import { PlusCircle, X } from 'lucide-react';

const MAX_IMAGE_BYTES = 100 * 1024;

const compressImage = async (file, maxBytes) => {
  const createImageBitmapSafe = async (blob) => {
    if ('createImageBitmap' in window) {
      return createImageBitmap(blob);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };

  const getBlob = (canvas, quality, mimeType) => new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));

  const originalBitmap = await createImageBitmapSafe(file);
  const width = originalBitmap.width;
  const height = originalBitmap.height;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const resize = (scale) => {
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalBitmap, 0, 0, canvas.width, canvas.height);
  };

  let quality = 0.92;
  let blob = null;
  let scale = 1;
  const mimeType = 'image/jpeg';

  do {
    resize(scale);
    blob = await getBlob(canvas, quality, mimeType);
    if (blob && blob.size <= maxBytes) break;
    quality = Math.max(0.25, quality - 0.12);
    if (quality <= 0.25 && scale > 0.4) {
      scale -= 0.1;
      quality = 0.92;
    }
  } while ((blob && blob.size > maxBytes) && (quality > 0.24 || scale > 0.4));

  return blob || file;
};

export default function PostFoodForm() {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: 'Hot Meal',
    quantity: '',
    city: 'Lagos',
    pickupStart: '',
    pickupEnd: '',
    kitchen: '',
    description: '',
    address: '',
    expiresAt: '',
    latitude: '',
    longitude: '',
  });

  const openFilePicker = () => uploadInputRef.current?.click();
  const openCamera = () => cameraInputRef.current?.click();

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setError('');
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) {
      setError('No files dropped.');
      return;
    }

    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      setError('Please drop a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    await processPhotoFile(file);
  };

  const processPhotoFile = async (file) => {
    setError('');
    setIsProcessing(true);
    setProcessingMessage('Compressing image...');
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + Math.random() * 30 : prev));
      }, 200);

      const compressedBlob = await compressImage(file, MAX_IMAGE_BYTES);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
      setPhotoFile(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));

      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!photoFile) {
      setError('Please upload or snap a photo first.');
      return;
    }

    if (!form.title || !form.quantity || !form.pickupStart || !form.pickupEnd || !form.kitchen) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setUploadPhase('listing');
    setUploadProgress(0);

    try {
      const listingPayload = {
        title: form.title,
        category: form.category,
        quantity: form.quantity,
        city: form.city,
        pickupStart: form.pickupStart,
        pickupEnd: form.pickupEnd,
        description: form.description,
        address: form.address,
        expiresAt: form.expiresAt,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      const { data: listing } = await createListing(listingPayload);
      
      setUploadPhase('photo');
      setUploadProgress(1);
      
      await uploadListingPhoto(listing.id, photoFile, (progress) => {
        setUploadProgress(Math.max(1, progress));
      });

      navigate('/dashboard');
    } catch (uploadError) {
      console.error(uploadError);
      setError(uploadError?.response?.data?.message || uploadError.message || 'Unable to create listing.');
    } finally {
      setIsSubmitting(false);
      setUploadPhase('');
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-green-900">Post surplus food</h2>
              <p className="text-sm text-mid-gray mt-1">Upload a photo, then complete the details to publish your listing.</p>
            </div>
            <Link to="/dashboard" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-dark transition">
              <X size={18} />
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-medium">Food photo *</span>
              <span className="text-xs text-mid-gray">Max 100KB</span>
            </div>
            <input
              id="upload-input"
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              id="camera-input"
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              className={`rounded-3xl border-2 border-dashed p-6 transition-all ${
                isDragging 
                  ? 'border-green-500 bg-green-100 scale-105' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Selected" className="w-full rounded-2xl object-cover max-h-72" />
              ) : (
                <div className="flex flex-col gap-4 items-center justify-center py-10 text-center text-sm text-mid-gray">
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <label htmlFor="upload-input" className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50">
                      Upload image
                    </label>
                    <label htmlFor="camera-input" className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50">
                      Take a photo
                    </label>
                  </div>
                  <div className="text-gray-500">or drag and drop an image file here</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Food title *</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Fresh Jollof Rice & Chicken"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <option>Hot Meal</option>
                <option>Snacks</option>
                <option>Bakery</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Quantity *</span>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Serves 6 / 10 loaves"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">City</span>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Pickup start *</span>
              <input
                name="pickupStart"
                type="datetime-local"
                value={form.pickupStart}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Pickup end *</span>
              <input
                name="pickupEnd"
                type="datetime-local"
                value={form.pickupEnd}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Your kitchen / business *</span>
            <input
              name="kitchen"
              value={form.kitchen}
              onChange={handleChange}
              placeholder="e.g. Mama Ada's Kitchen"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Notes for the claimer</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Allergens, packaging, where to collect..."
              className="mt-2 w-full min-h-[140px] rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Address</span>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 12 Market Road"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Expires at</span>
              <input
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Latitude</span>
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="6.5244"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Longitude</span>
              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="3.3792"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-green-300 focus:outline-none"
              />
            </label>
          </div>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {(isProcessing || isSubmitting) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">
                  {isProcessing && 'Compressing image...'}
                  {isSubmitting && uploadPhase === 'listing' && 'Creating listing...'}
                  {isSubmitting && uploadPhase === 'photo' && 'Uploading image...'}
                </span>
                <span className="text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link to="/dashboard" className="inline-flex justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isProcessing || !photoFile}
              className="inline-flex justify-center rounded-2xl bg-green-800 px-5 py-3 text-sm font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? 'Processing...' : isSubmitting ? 'Publishing...' : 'Publish listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
