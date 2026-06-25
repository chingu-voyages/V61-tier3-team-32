import { useState } from "react";
import { X, UserPlus, ChefHat, ShoppingBasket, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Abeokuta",
  "Enugu",
  "Kaduna",
  "Benin City",
  "Jos"
];

const initialFormState = {
  name: "",
  email: "",
  password: "",
  role: "claimer",
  city: "Lagos",
};

export default function SignupModal({ onClose, onSwitchToLogin, onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const selectRole = (role) => () => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (form.name.trim().length === 0) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form);
      onSuccess?.();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-dark">Create your account</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-mid-gray hover:text-dark transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1 text-sm text-mid-gray">
          Join the community to post surplus and claim meals nearby.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-dark mb-1"
            >
              Full name *
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={updateField("name")}
              placeholder="Adaeze Okonkwo"
              className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-dark mb-1">
              I want to *
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={selectRole("donor")}
                className={`rounded-xl border p-3 text-left transition ${form.role === "donor"
                  ? "border-primary bg-primary-light"
                  : "border-gray-200 bg-white"
                  }`}
              >
                <ChefHat className="h-5 w-5 text-dark mb-1" />
                <p className="font-semibold text-sm text-dark">Post food</p>
                <p className="text-xs text-mid-gray">
                  Share surplus from my kitchen
                </p>
              </button>
              <button
                type="button"
                onClick={selectRole("claimer")}
                className={`rounded-xl border p-3 text-left transition ${form.role === "claimer"
                  ? "border-primary bg-primary-light"
                  : "border-gray-200 bg-white"
                  }`}
              >
                <ShoppingBasket className="h-5 w-5 text-dark mb-1" />
                <p className="font-semibold text-sm text-dark">Claim food</p>
                <p className="text-xs text-mid-gray">Find meals near me</p>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-dark mb-1"
            >
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-dark mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField("password")}
                placeholder="At least 8 characters"
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

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-dark mb-1"
            >
              City *
            </label>
            <select
              id="city"
              value={form.city}
              onChange={updateField("city")}
              className="w-full rounded-lg border border-gray-200 bg-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            >
              {NIGERIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-accent disabled:opacity-60 text-white py-2.5 font-semibold transition"
          >
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-center text-sm text-mid-gray">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary font-medium hover:underline"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
