import { useState } from "react";
import { X, LogIn, Eye, EyeOff, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

export default function LoginModal({ onClose, onSwitchToSignup, onSuccess }) {
  const { login } = useAuth();

  // views: "login" | "forgot" | "forgot-sent"
  const [view, setView] = useState("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length === 0) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Invalid email or password. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotEmail.includes("@")) {
      setForgotError("Enter a valid email address.");
      return;
    }

    setIsSendingReset(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setView("forgot-sent");
    } catch (err) {
      // Even if the email doesn't exist, show success for security (don't reveal emails)
      setView("forgot-sent");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-dark">Log in to FoodRescue</h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="text-mid-gray hover:text-dark transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-sm text-mid-gray">
              Welcome back — claim or post food in your area.
            </p>

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-dark mb-1">
                  Email *
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-sm font-medium text-dark">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setForgotEmail(email); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-dark transition"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 disabled:opacity-60 text-white py-2.5 font-semibold transition"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>

              <p className="text-center text-sm text-mid-gray">
                New here?{" "}
                <button type="button" onClick={onSwitchToSignup} className="text-primary font-medium hover:underline">
                  Create an account
                </button>
              </p>
            </form>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === "forgot" && (
          <>
            <div className="flex items-start justify-between">
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex items-center gap-1 text-sm text-mid-gray hover:text-dark transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button" onClick={onClose} aria-label="Close" className="text-mid-gray hover:text-dark transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 mb-6 text-center">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Reset your password</h2>
              <p className="text-sm text-mid-gray">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-dark mb-1">
                  Email address *
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>

              {forgotError && <p role="alert" className="text-sm text-red-500">{forgotError}</p>}

              <button
                type="submit"
                disabled={isSendingReset}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 disabled:opacity-60 text-white py-2.5 font-semibold transition"
              >
                <Mail className="h-4 w-4" />
                {isSendingReset ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        {/* ── FORGOT SENT VIEW ── */}
        {view === "forgot-sent" && (
          <div className="text-center py-4">
            <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 text-mid-gray hover:text-dark transition">
              <X className="h-5 w-5" />
            </button>
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-dark mb-2">Check your inbox</h2>
            <p className="text-sm text-mid-gray mb-6">
              If an account exists for <span className="font-medium text-dark">{forgotEmail}</span>, we've sent a password reset link. It may take a minute to arrive.
            </p>
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm text-primary font-medium hover:underline"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
