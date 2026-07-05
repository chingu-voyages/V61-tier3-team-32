import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Star, MapPin, Calendar, Utensils, Leaf } from 'lucide-react';
import { getDonorProfile, getDonorListings, getDonorRatings, getDonorStats } from '../lib/api';

export default function DonorProfile() {
  const { donorId } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    communityRating: 0,
    mealsShared: 0,
    carbonSaved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        setLoading(true);
        const [donorRes, listingsRes, ratingsRes, statsRes] = await Promise.all([
          getDonorProfile(donorId),
          getDonorListings(donorId),
          getDonorRatings(donorId),
          getDonorStats(donorId),
        ]);

        setDonor(donorRes.data);
        setListings(listingsRes.data);
        setReviews(ratingsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching donor profile:', err);
        setError('Failed to load donor profile');
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      fetchDonorProfile();
    }
  }, [donorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Donor not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffMs = now - reviewDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-mid-gray hover:text-dark transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white flex-shrink-0">
                <Utensils size={64} />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{donor.name}</h1>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{donor.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined in {formatDate(donor.createdAt).split(' ')[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Button */}
            <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold flex items-center gap-2">
              <MessageCircle size={18} />
              Message
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Community Rating */}
            <div className="bg-primary rounded-2xl p-6 text-white text-center">
              <div className="flex justify-center mb-2">
                <Star size={32} fill="white" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.communityRating}</p>
              <p className="text-sm uppercase tracking-wide">Community Rating</p>
            </div>

            {/* Meals Shared */}
            <div className="bg-blue-100 rounded-2xl p-6 text-primary text-center">
              <div className="flex justify-center mb-2 text-primary">
                <Utensils size={32} />
              </div>
              <p className="text-3xl font-bold mb-1 text-gray-900">{stats.mealsShared}</p>
              <p className="text-sm uppercase tracking-wide text-gray-700">Meals Shared</p>
            </div>

            {/* Carbon Saved */}
            <div className="bg-blue-100 rounded-2xl p-6 text-primary text-center">
              <div className="flex justify-center mb-2 text-primary">
                <Leaf size={32} />
              </div>
              <p className="text-3xl font-bold mb-1 text-gray-900">{stats.carbonSaved}kg</p>
              <p className="text-sm uppercase tracking-wide text-gray-700">Carbon Saved</p>
            </div>

            {/* Placeholder for alignment */}
            <div></div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* About the Donor */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold">
                  i
                </div>
                <h2 className="text-lg font-bold text-gray-900">About the Donor</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                A community member committed to reducing food waste and supporting neighbors in need. Join us in making a difference!
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-900">Joined</p>
                <p className="text-gray-700 mt-1">{formatDate(donor.createdAt)}</p>
              </div>
            </div>

            {/* Active Listings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Active Listings ({listings.length})
              </h2>
              <div className="space-y-4">
                {listings.slice(0, 2).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {listing.photoUrl ? (
                        <img
                          src={listing.photoUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <Utensils size={20} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{listing.title}</p>
                      <p className="text-sm text-gray-600">
                        {listing.quantity} {listing.quantity === 1 ? 'item' : 'items'} left
                      </p>
                      <p className="text-xs font-semibold text-orange-600 mt-1">
                        Expires in {Math.ceil((new Date(listing.expiresAt) - new Date()) / (1000 * 60 * 60))}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Reviews */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <button className="text-primary hover:underline font-semibold flex items-center gap-1">
                  View all
                  <span>›</span>
                </button>
              </div>

              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-bold text-gray-900">{review.reviewerName}</p>
                        <p className="text-xs text-gray-500">{getTimeAgo(review.createdAt)}</p>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.score ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 italic">{review.reviewText}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
