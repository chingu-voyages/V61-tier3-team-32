import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import { getListings } from "../lib/api";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Claimed", value: "claimed" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
];

const STATUS_BADGE = {
  active: "bg-primary-light text-primary",
  claimed: "bg-blue-100 text-blue-700",
  completed: "bg-gray-200 text-mid-gray",
  expired: "bg-red-100 text-danger",
};

const CATEGORY_BADGE = {
  "Hot Meal": "bg-red-100 text-red-800",
  Snacks: "bg-blue-100 text-blue-800",
  Bakery: "bg-yellow-100 text-yellow-800",
};

function formatTimeAgo(createdAt) {
  const diffMins = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function AllListings() {
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await getListings({
          status,
          city: city || undefined,
          page,
          limit,
        });
        if (cancelled) return;
        setListings(data.listings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to load listings:", err);
        if (!cancelled) setError("Unable to load listings. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status, city, page, limit]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setPage(1);
  };

  const goToPage = (next) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">All listings</h1>
        <p className="mt-1 text-mid-gray">
          Browse every listing on FoodRescue, filtered by status and city.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                status === filter.value
                  ? "bg-primary text-white"
                  : "bg-white text-mid-gray border border-gray-200 hover:border-primary/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-mid-gray" />
          <select
            value={city}
            onChange={handleCityChange}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          >
            <option value="">All cities</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="Port Harcourt">Port Harcourt</option>
            <option value="Kano">Kano</option>
            <option value="Ibadan">Ibadan</option>
            <option value="Abeokuta">Abeokuta</option>
            <option value="Enugu">Enugu</option>
            <option value="Kaduna">Kaduna</option>
            <option value="Benin City">Benin City</option>
            <option value="Jos">Jos</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      {!isLoading && !error && (
        <p className="text-sm text-mid-gray mb-4">
          {total} listing{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && <p className="text-danger">{error}</p>}

      {!isLoading && !error && listings.length === 0 && (
        <p className="text-mid-gray">No listings match these filters.</p>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    CATEGORY_BADGE[listing.category] ||
                    "bg-green-100 text-green-800"
                  }`}
                >
                  {listing.category || "Food"}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                    STATUS_BADGE[listing.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {listing.status}
                </span>
              </div>

              <h4 className="text-xl font-bold text-dark mb-1">
                {listing.title}
              </h4>
              <p className="text-sm text-mid-gray mb-1">
                {listing.donor?.name}
              </p>
              <p className="text-mid-gray text-sm mb-4">{listing.quantity}</p>

              <div className="flex items-center justify-between text-sm text-mid-gray mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary" />
                  {listing.city || "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatTimeAgo(listing.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-light-gray transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
                acc.push(p);
                return acc;
              }, [])
              .map((p) =>
                typeof p === "string" ? (
                  <span key={p} className="px-2 text-mid-gray">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                      p === page
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-200 text-dark hover:bg-light-gray"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-light-gray transition"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/"
          className="text-sm text-primary font-medium hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
