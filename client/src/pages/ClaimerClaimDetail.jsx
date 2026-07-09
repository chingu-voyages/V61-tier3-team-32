import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClaimById } from "../lib/api";
import { CheckCircle2, Clock, Info, ArrowLeft, Bell } from "lucide-react";

export default function ClaimerClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadClaim() {
      try {
        const { data } = await getClaimById(id);
        if (mounted) setClaim(data);
      } catch (err) {
        if (mounted) setError("Failed to load claim details.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadClaim();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Claim not found"}</p>
        <button
          onClick={() => navigate("/claimer")}
          className="text-primary font-medium hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isConfirmed = claim.status === "confirmed";
  const pickupAddress = claim.pickupAddress || claim.listing.address || "Waiting for donor to provide address";
  const contactEmail = claim.contactEmail || claim.listing.donor.email || "Waiting for donor email";
  const contactPhone = claim.contactPhone || claim.listing.donor.phoneNumber || "N/A";

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 h-16">
        <button 
          onClick={() => navigate("/notifications")}
          className="flex items-center gap-2 text-sm font-medium text-mid-gray hover:text-dark transition"
        >
          <ArrowLeft size={18} />
          Back to Notifications
        </button>
        <div className="text-xl font-bold tracking-tight text-primary absolute left-1/2 -translate-x-1/2">
          FoodRescue
        </div>
        <button className="text-mid-gray hover:text-dark transition p-1">
          <Bell size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-16 px-4">
        
        {/* Status Icon */}
        <div className="mb-6">
          {isConfirmed ? (
            <div className="w-16 h-16 bg-[#2B5F4A] rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle2 size={32} className="text-white" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Clock size={32} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="text-center mb-8 max-w-sm">
          <h1 className="text-2xl font-bold text-[#113220] mb-2">
            {isConfirmed ? "Claim Confirmed & Ready for Pickup" : "Claim Pending"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isConfirmed 
              ? "The donor has approved your claim. Please find the collection details below."
              : "Waiting for the donor to approve your claim. We will notify you once confirmed."}
          </p>
        </div>

        {/* Details Card */}
        {isConfirmed && (
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 mb-8">
            
            {/* Pickup Address */}
            <div className="border border-gray-100 rounded-xl p-4 bg-[#F9FAFB]/50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Pickup Address
              </p>
              <p className="text-base font-semibold text-dark">
                {pickupAddress}
              </p>
            </div>

            {/* Contact Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-4 bg-[#F9FAFB]/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Contact Email
                </p>
                <p className="text-base font-semibold text-dark truncate" title={contactEmail}>
                  {contactEmail}
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 bg-[#F9FAFB]/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Phone Number
                </p>
                <p className="text-base font-semibold text-dark truncate" title={contactPhone}>
                  {contactPhone}
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="mt-6 bg-[#F9FAFB] rounded-xl p-4 flex gap-3 text-sm text-gray-500 border border-gray-50">
              <Info className="flex-shrink-0 mt-0.5" size={18} />
              <p className="leading-relaxed text-xs sm:text-sm">
                <span className="font-semibold text-gray-600">Notice:</span> All listings on FoodRescue are surplus food items shared by local businesses and neighbors. Always use your best judgment and inspect your items thoroughly at the pickup location before eating
              </p>
            </div>
          </div>
        )}
        
        {/* Support Link */}
        <div className="text-center text-sm text-gray-500 mb-12">
          Having trouble with this pickup? <button className="font-semibold text-dark hover:underline">Contact FoodRescue Support</button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xl font-bold tracking-tight text-[#113220]">
            FoodRescue
          </div>
          <p className="text-xs text-gray-400">
            © 2024 FoodRescue Community. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-medium text-gray-500">
            <button className="hover:text-dark">Privacy Policy</button>
            <button className="hover:text-dark">Terms of Service</button>
            <button className="hover:text-dark">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
