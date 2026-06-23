import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setStatus("success");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "This reset link is invalid or has expired.";
      setError(message);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-3">Password updated!</h2>
          <p className="text-mid-gray text-sm mb-6">
            Your password has been successfully reset. You can now log in with your new credentials.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary hover:bg-opacity-90 text-white py-2.5 rounded-xl font-semibold transition"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-light p-2 rounded-full">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-dark">Choose a new password</h2>
        </div>
        <p className="text-sm text-mid-gray mb-6">
          Your new password must be at least 8 characters long.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-dark mb-1">
              New password *
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-dark transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-dark mb-1">
              Confirm password *
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-dark transition"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition"
          >
            <Lock className="h-4 w-4" />
            {isSubmitting ? "Updating password..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
