import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Loader2,
} from "lucide-react";

import { getClaimDetails, confirmClaim, declineClaim } from "../lib/api";
import SendPickupDetailsModal from "../components/claims/SendPickupDetailsModal";

const STATUS_BADGE = {
  pending: {
    label: "New Claim Pending",
    className: "bg-urgency/10 text-urgency",
  },
  confirmed: {
    label: "Claim Confirmed",
    className: "bg-primary-light text-primary",
  },
  declined: { label: "Claim Declined", className: "bg-red-50 text-danger" },
  no_show: { label: "Marked No Show", className: "bg-gray-100 text-mid-gray" },
};

function formatWindow(pickupStart, pickupEnd) {
  if (!pickupStart || !pickupEnd) return "—";
  const start = new Date(pickupStart);
  const end = new Date(pickupEnd);
  const dayLabel =
    start.toDateString() === new Date().toDateString()
      ? "Today"
      : start.toLocaleDateString([], { month: "short", day: "numeric" });
  const fmt = (d) =>
    d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${dayLabel}, ${fmt(start)} — ${fmt(end)}`;
}

export default function ClaimDetails() {
  const { claimId } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showSendDetails, setShowSendDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await getClaimDetails(claimId);
        if (!cancelled) setClaim(data);
      } catch (err) {
        console.error("Failed to load claim:", err);
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load this claim. It may not exist or you may not have access to it.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setActionError("");
    try {
      const { data } = await confirmClaim(claimId);
      setClaim((prev) => ({ ...prev, status: data.status }));
      setShowSendDetails(true);
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Could not confirm this claim. Please try again.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    setActionError("");
    try {
      await declineClaim(claimId);
      navigate("/donor");
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Could not decline this claim. Please try again.",
      );
      setIsDeclining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-danger font-medium mb-4">
          {error || "Claim not found"}
        </p>
        <button
          onClick={() => navigate("/donor")}
          className="text-primary font-medium hover:underline"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_BADGE[claim.status] || STATUS_BADGE.pending;
  const isPending = claim.status === "pending";
  const listing = claim.listing;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate("/donor")}
        className="flex items-center gap-2 text-sm font-medium text-mid-gray hover:text-dark transition mb-6"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusInfo.className}`}
        >
          {isPending && <AlertTriangle size={13} />}
          {statusInfo.label}
        </span>
        <h1 className="text-4xl font-extrabold text-dark tracking-tight mt-3">
          Claim Details
        </h1>
      </div>

      {actionError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-bold text-mid-gray uppercase tracking-widest mb-3">
                Claimer
              </p>
              <p className="text-xl font-bold text-dark">
                {claim.claimer?.name}
              </p>
              {claim.claimer?.city && (
                <p className="text-sm text-mid-gray mt-1">
                  {claim.claimer.city}
                </p>
              )}
            </div>

            <div className="bg-primary rounded-2xl p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
                Items Requested
              </p>
              <p className="text-2xl font-bold mb-1">{listing?.quantity}</p>
              <p className="text-white/90">{listing?.title}</p>
              {listing?.category && (
                <div className="flex items-center gap-2 mt-4 text-sm font-medium text-white/90">
                  <Utensils size={14} />
                  {listing.category} Category
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                <Clock size={18} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-dark">Pickup Window</h2>
            </div>
            <div className="bg-light-gray rounded-xl p-4">
              <p className="text-xs font-bold text-mid-gray uppercase tracking-wider mb-1">
                Requested Time
              </p>
              <p className="text-lg font-bold text-dark">
                {formatWindow(listing?.pickupStart, listing?.pickupEnd)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-primary/30 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-dark mb-4">Review Claim</h2>

          {isPending ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming || isDeclining}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-opacity-90 disabled:opacity-60 text-white py-3 font-bold transition"
              >
                <CheckCircle2 size={18} />
                {isConfirming ? "Confirming..." : "Confirm Claim"}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={isConfirming || isDeclining}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-danger text-danger hover:bg-red-50 disabled:opacity-60 py-3 font-bold transition"
              >
                <XCircle size={18} />
                {isDeclining ? "Declining..." : "Decline Claim"}
              </button>
              <p className="text-xs text-mid-gray text-center pt-1">
                Confirming this claim will notify {claim.claimer?.name} and
                reserve the items for their pickup window.
              </p>
            </div>
          ) : claim.status === "confirmed" ? (
            <div className="space-y-3">
              <p className="text-sm text-mid-gray">
                This claim has been confirmed.
                {claim.detailsSentAt
                  ? " Pickup details have been sent to the claimer."
                  : " Send the claimer your pickup details so they know where and how to reach you."}
              </p>
              {!claim.detailsSentAt && (
                <button
                  type="button"
                  onClick={() => setShowSendDetails(true)}
                  className="w-full rounded-xl bg-primary hover:bg-opacity-90 text-white py-3 font-bold transition"
                >
                  Send Pickup Details
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-mid-gray">
              This claim was{" "}
              {claim.status === "declined" ? "declined" : "marked as a no-show"}
              .
            </p>
          )}
        </div>
      </div>

      <SendPickupDetailsModal
        isOpen={showSendDetails}
        claim={claim}
        onClose={() => setShowSendDetails(false)}
        onSent={(updatedClaim) =>
          setClaim((prev) => ({ ...prev, ...updatedClaim }))
        }
      />
    </div>
  );
}
