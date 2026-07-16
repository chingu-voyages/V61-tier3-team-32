import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  User,
  Phone,
  MapPin,
  BookOpen,
  Building2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePhoto } from '../lib/api';

const BUSINESS_TYPES = [
  'Restaurant / Fast Food',
  'Grocery / Supermarket',
  'Caterer / Events',
  'Cloud Kitchen / Meal Prep',
  'Individual / Household',
];

const MAX_PROFILE_IMAGE_BYTES = 250 * 1024;

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

  const getBlob = (canvas, quality, mimeType) =>
    new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));

  const originalBitmap = await createImageBitmapSafe(file);
  const { width, height } = originalBitmap;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const mimeType = 'image/jpeg';

  const resize = (scale) => {
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalBitmap, 0, 0, canvas.width, canvas.height);
  };

  let quality = 0.9;
  let scale = 1;
  let blob = null;

  do {
    resize(scale);
    blob = await getBlob(canvas, quality, mimeType);
    if (blob && blob.size <= maxBytes) break;

    quality = Math.max(0.35, quality - 0.12);
    if (quality <= 0.35 && scale > 0.3) {
      scale -= 0.15;
      quality = 0.9;
    }
  } while (blob && blob.size > maxBytes && (quality > 0.34 || scale > 0.3));

  return blob || file;
};

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl animate-fade-in ${isError ? 'bg-red-600 text-white' : 'bg-[#1A3C2E] text-white'
        }`}
    >
      {isError ? (
        <AlertCircle size={18} className="shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="shrink-0 text-green-300" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

export default function AccountSettings() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    businessName: '',
    phoneNumber: '',
    city: '',
    story: '',
    businessType: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [toast, setToast] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        businessName: user.businessName || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        story: user.story || '',
        businessType: user.businessType || '',
      });
      if (user.photoUrl) setPhotoPreview(user.photoUrl);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose a valid image file.', 'error');
      return;
    }

    try {
      const compressedBlob = await compressImage(file, MAX_PROFILE_IMAGE_BYTES);
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, '.jpg'),
        { type: 'image/jpeg' },
      );

      setPendingPhotoFile(compressedFile);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Photo processing error:', err);
      showToast('Failed to process photo. Please try another image.', 'error');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload photo first if one is pending
      if (pendingPhotoFile) {
        setIsUploadingPhoto(true);
        try {
          const { data: photoData } = await uploadProfilePhoto(pendingPhotoFile);
          if (photoData?.photoUrl) {
            updateUser({ photoUrl: photoData.photoUrl });
          }
          setPendingPhotoFile(null);
        } catch (err) {
          console.error('Photo upload error:', err);
          showToast(
            err?.response?.data?.message ||
              'Failed to upload photo. Other changes will still be saved.',
            'error',
          );
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      // Save profile data
      const { data } = await updateProfile({
        businessName: form.businessName,
        phoneNumber: form.phoneNumber,
        city: form.city,
        story: form.story,
        businessType: form.businessType,
      });

      // Sync the in-memory user so form pre-fills correctly on next render
      if (data?.user) updateUser(data.user);

      showToast('Your settings have been saved successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      showToast(err?.response?.data?.message || 'Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setForm({
        businessName: user.businessName || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        story: user.story || '',
        businessType: user.businessType || '',
      });
      setPhotoPreview(user.photoUrl || null);
      setPendingPhotoFile(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-[#F0F4F0]">
      <Toast toast={toast} />

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-mid-gray hover:text-dark transition"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <UtensilsCrossed size={20} />
            <span>FoodRescue</span>
          </div>
          <div className="flex items-center gap-2 opacity-0 pointer-events-none">
            {/* spacer */}
            <span className="text-sm">Settings</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-dark tracking-tight">Account Settings</h1>
          <p className="text-mid-gray text-sm mt-1 italic">
            Manage your kitchen profile and business information.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — Avatar card */}
          <div className="flex flex-col items-center gap-3 lg:w-52 shrink-0">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-green-700 flex items-center justify-center">
                    <UtensilsCrossed size={48} className="text-white opacity-80" />
                  </div>
                )}
              </div>

              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition border-2 border-white"
                title="Upload photo"
              >
                {isUploadingPhoto ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="profile-photo-input"
              />
            </div>

            <div className="text-center">
              <p className="font-bold text-dark text-lg leading-snug">
                {form.businessName || user?.businessName || user?.name}
              </p>
              <p className="text-sm text-mid-gray mt-0.5">{user?.name}</p>
              {memberSince && (
                <p className="text-xs text-mid-gray mt-1">Member since {memberSince}</p>
              )}
            </div>

            {pendingPhotoFile && (
              <p className="text-xs text-primary font-medium text-center px-2">
                New photo ready — click Save to apply
              </p>
            )}
          </div>

          {/* Right — Form sections */}
          <div className="flex-1 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <User size={18} className="text-primary" />
                <h2 className="text-base font-bold text-dark">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Kitchen Name */}
                <div>
                  <label
                    htmlFor="settings-businessName"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                  >
                    Kitchen Name
                  </label>
                  <input
                    id="settings-businessName"
                    name="businessName"
                    type="text"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Mama Ada's Kitchen"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="settings-phone"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
                    <input
                      id="settings-phone"
                      name="phoneNumber"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="+234 802 345 6789"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="settings-city"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
                  <input
                    id="settings-city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Yaba, Lagos, Nigeria"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Our Story */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-primary" />
                <h2 className="text-base font-bold text-dark">Our Story</h2>
              </div>
              <p className="text-xs text-mid-gray italic mb-4">
                Tell us about your mission and passion for food rescue...
              </p>
              <textarea
                id="settings-story"
                name="story"
                rows={6}
                value={form.story}
                onChange={handleChange}
                placeholder="Share the story behind your kitchen and why you rescue food..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
              />
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Building2 size={18} className="text-primary" />
                <h2 className="text-base font-bold text-dark">Business Details</h2>
              </div>

              <div>
                <label
                  htmlFor="settings-business-type"
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Business Type
                </label>

                {/* Custom dropdown */}
                <div className="relative">
                  <button
                    id="settings-business-type"
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-dark hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  >
                    <span className={form.businessType ? 'text-dark' : 'text-mid-gray'}>
                      {form.businessType || 'Select business type'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-mid-gray transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {BUSINESS_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, businessType: type }));
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition hover:bg-gray-50 ${form.businessType === type
                            ? 'text-primary font-semibold bg-green-50'
                            : 'text-dark'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-7 py-2.5 rounded-xl font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isSaving}
                className="text-sm font-medium text-mid-gray hover:text-dark transition disabled:opacity-50"
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
