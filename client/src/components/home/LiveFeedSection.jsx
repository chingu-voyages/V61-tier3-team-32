import { useEffect, useState } from 'react';
import { Clock, MapPin, Star } from "lucide-react";
import { getListings } from '../../lib/api';

export default function LiveFeedSection() {
  const filters = ["All", "Lagos", "Abuja", "Port Harcourt", "Ibadan"];
  const [listings, setListings] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError('');
      try {
        const city = selectedCity === "All" ? null : selectedCity;
        const { data } = await getListings(city);
        setListings(data);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        setError('Unable to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [selectedCity]);

  const formatTimeLeft = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getCategoryBg = (category) => {
    switch (category) {
      case 'Hot Meal':
        return 'bg-red-100 text-red-800';
      case 'Snacks':
        return 'bg-blue-100 text-blue-800';
      case 'Bakery':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <section className="py-20 bg-[#FAFAFA]" id="feed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-2">Live feed</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">Available right now near you</h3>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedCity(filter)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition ${
                selectedCity === filter
                  ? "bg-primary text-white"
                  : "bg-white text-mid-gray border border-gray-200 hover:border-primary/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && <p className="text-mid-gray">Loading listings...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!isLoading && listings.length === 0 && <p className="text-mid-gray">No listings available</p>}
          
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryBg(listing.category)}`}>
                  {listing.category}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  <Clock size={14} />
                  {formatTimeLeft(listing.createdAt)}
                </span>
              </div>

              <h4 className="text-xl font-bold text-dark mb-2">{listing.title}</h4>
              <p className="text-mid-gray text-sm mb-6">
                {listing.quantity}
              </p>

              <div className="flex items-center justify-between text-sm text-mid-gray mb-8">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary" />
                  {listing.city}
                </div>
              </div>

              <button className="mt-auto w-full bg-primary hover:bg-opacity-90 text-white font-medium py-3 rounded-xl transition">
                Claim this food
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
