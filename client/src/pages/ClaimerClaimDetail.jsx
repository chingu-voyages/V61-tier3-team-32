import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UtensilsCrossed,
  MapPin,
  Clock,
  Calendar,
  Package,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { getClaimById } from "../lib/api";

// ─── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending Confirmation",
    icon: Clock,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    iconColor: "text-yellow-500",
    dot: "bg-yellow-400",
    description:
      "Your claim has been received. The donor will confirm your pickup details shortly.",
  },
  confirmed: {
    label: "Confirmed — Ready for Pickup",
    icon: CheckCircle2,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-500",
    dot: "bg-green-500",
    description:
      "The donor has confirmed your claim. Head over during the pickup window to collect your food.",
  },
  no_show: {
    label: "No Show",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-400",
    dot: "bg-red-400",
    description:
      "This claim was marked as a no-show. The pickup window has passed.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────
function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

// ─── Sub-components ───────────────────────────────────────────────
function StatusBanner({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border ${cfg.bg} ${cfg.border} px-5 py-4`}
    >
      <Icon size={22} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <div>
        <p className={`font-bold ${cfg.text}`}>{cfg.label}</p>
        <p className="mt-0.5 text-sm text-gray-600">{cfg.description}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ClaimerClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    getClaimById(id)
      .then(({ data }) => {
        if (!cancelled) setClaim(data);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.response?.status === 404
              ? "This claim doesn't exist or may have been removed."
              : err?.response?.status === 403
                ? "You don't have permission to view this claim."
                : "Unable to load claim details. Please try again.";
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const listing = claim?.listing;
  const donor = listing?.donor;

  const pickupWindow =
    listing?.pickupStart && listing?.pickupEnd
      ? `${formatDateTime(listing.pickupStart)} – ${formatDateTime(listing.pickupEnd)}`
      : null;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <UtensilsCrossed size={23} />
            <span className="text-xl font-bold tracking-tight">FoodRescue</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hidden items-center gap-2 text-sm font-medium text-primary transition hover:text-dark sm:flex"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full p-2 text-dark transition hover:bg-gray-100 sm:hidden"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-0">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1D33] sm:text-4xl">
            Claim Details
          </h1>
          {claim && (
            <p className="mt-1 text-sm text-gray-400">
              Claimed on {formatDate(claim.claimedAt)}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-primary">
            <Loader2 size={34} className="animate-spin" />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
            <AlertTriangle size={32} className="text-red-400" />
            <p className="font-semibold text-red-700">{error}</p>
            <Link
              to="/claimer"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && claim && (
          <div className="space-y-5">
            {/* Status banner */}
            <StatusBanner status={claim.status} />

            {/* Listing card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {listing?.photoUrl && (
                <img
                  src={listing.photoUrl}
                  alt={listing.title}
                  className="h-52 w-full object-cover"
                />
              )}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      {listing?.category || "Food Item"}
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                      {listing?.title || "Unknown Item"}
                    </h2>
                  </div>
                  {/* Status pill */}
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${STATUS_CONFIG[claim.status]?.bg || "bg-gray-100"
                      } ${STATUS_CONFIG[claim.status]?.text || "text-gray-700"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[claim.status]?.dot || "bg-gray-400"
                        }`}
                    />
                    {STATUS_CONFIG[claim.status]?.label || claim.status}
                  </span>
                </div>

                {listing?.description && (
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {listing.description}
                  </p>
                )}

                <div className="mt-5 space-y-0 divide-y divide-gray-100">
                  <InfoRow
                    icon={Package}
                    label="Quantity"
                    value={listing?.quantity}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Pickup Location"
                    value={
                      listing?.address ||
                      listing?.city ||
                      "Contact donor for address"
                    }
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Pickup Window"
                    value={pickupWindow}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Expires"
                    value={formatDateTime(listing?.expiresAt)}
                  />
                </div>
              </div>
            </div>

            {/* Donor card */}
            {donor && (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                  Donor
                </h3>
                <div className="flex items-center gap-4">
                  {donor.photoUrl ? (
                    <img
                      src={donor.photoUrl}
                      alt={donor.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {(donor.businessName || donor.name || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">
                      {donor.businessName || donor.name}
                    </p>
                    {donor.city && (
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {donor.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-0 divide-y divide-gray-100">
                  {donor.phoneNumber && (
                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={donor.phoneNumber}
                    />
                  )}
                  <InfoRow icon={Mail} label="Email" value={donor.email} />
                </div>
              </div>
            )}

            {/* Pickup reminder banner */}
            <div className="flex items-start gap-3 rounded-xl border border-urgency/30 bg-urgency/10 p-4">
              <AlertTriangle className="h-5 w-5 text-urgency mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-dark text-sm">
                  Pickup Reminder
                </p>
                <p className="mt-0.5 text-sm text-mid-gray">
                  Please collect this item before the pickup window ends. If the
                  item looks or smells unsafe when you arrive, do not collect or
                  consume it and leave a rating to inform the community.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <Link
                to="/claimer"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-bold text-dark transition hover:border-primary hover:text-primary"
              >
                Back to Dashboard
              </Link>
              {listing?.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(listing.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  <ExternalLink size={15} />
                  Get Directions
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
