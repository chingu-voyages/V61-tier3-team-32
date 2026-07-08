import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Send,
  X,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { sendClaimPickupDetails } from "../../lib/api";

export default function SendPickupDetailsModal({
  isOpen,
  claim,
  onClose,
  onSent,
}) {
  const { user } = useAuth();

  const [pickupAddress, setPickupAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPickupAddress(user?.city || "");
      setContactEmail(user?.email || "");
      setContactPhone(user?.phoneNumber || "");
      setError("");
      setSent(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!pickupAddress.trim()) {
      setError("Pickup address is required.");
      return;
    }
    if (!contactEmail.includes("@")) {
      setError("Enter a valid contact email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await sendClaimPickupDetails(claim.id, {
        pickupAddress: pickupAddress.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });
      setSent(true);
      onSent?.(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not send pickup details. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-mid-gray hover:text-dark transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-dark mb-2">
          {sent ? "Details Sent!" : "Claim Confirmed!"}
        </h2>
        <p className="text-sm text-mid-gray mb-6">
          {sent
            ? `${claim.claimer?.name} has been notified with your pickup details.`
            : "The claimer has been notified and is on their way."}
        </p>

        {!sent && (
          <>
            <p className="text-sm text-dark text-left mb-4">
              Please provide the pickup details for the claimer to contact you
              with.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label
                  htmlFor="pickupAddress"
                  className="block text-xs font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
                >
                  Pickup Address
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                  <input
                    id="pickupAddress"
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="12 Adeola Hopewell St, Victoria Island, Lagos"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-light-gray text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-xs font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
                  >
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    />
                    <input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-light-gray text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-xs font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    />
                    <input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+234 802 123 4567"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-light-gray text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-opacity-90 disabled:opacity-60 text-white py-3 font-bold transition"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Send to Claimer
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {sent && (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary hover:bg-opacity-90 text-white py-3 font-bold transition"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
