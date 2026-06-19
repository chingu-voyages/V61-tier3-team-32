import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";

function NavAuth({ onOpenLogin, onOpenSignup }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-32" />;
  }

  if (isAuthenticated) {
    const firstName = user.name?.split(" ")[0] ?? "";
    const displayName =
      firstName.length > 5 ? `${firstName.slice(0, 5)}...` : firstName;

    return (
      <div className="flex items-center gap-3">
        <span className="font-medium">Hi, {displayName}</span>
        <button
          onClick={logout}
          className="text-sm font-medium hover:text-primary-light border border-primary-light rounded-md px-2 py-1"
        >
          Log out
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onOpenLogin}
        className="font-medium hover:text-primary-light"
      >
        Log in
      </button>
      <button
        onClick={onOpenSignup}
        className="bg-white text-primary px-4 py-1.5 rounded-lg font-medium hover:bg-primary-light transition"
      >
        Sign up
      </button>
    </div>
  );
}

function AppShell() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const closeAll = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen bg-light-gray text-dark">
      <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">FoodRescue</h1>
        <nav>
          <NavAuth onOpenLogin={openLogin} onOpenSignup={openSignup} />
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-3xl font-bold mb-4">
                  Don't waste it. Share it.
                </h2>
                <p className="text-mid-gray max-w-lg text-center mb-8">
                  FoodRescue connects food donors with claimers to redistribute
                  surplus food in real time.
                </p>
                <button className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-lg shadow-sm transition">
                  Browse Feed
                </button>
              </div>
            }
          />
        </Routes>
      </main>

      {showLogin && (
        <LoginModal
          onClose={closeAll}
          onSwitchToSignup={openSignup}
          onSuccess={closeAll}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={closeAll}
          onSwitchToLogin={openLogin}
          onSuccess={closeAll}
        />
      )}
    </div>
  );
}

export default AppShell;
