import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { UtensilsCrossed, LogIn, UserPlus, Menu, X, ChevronUp, LayoutDashboard, CheckCircle2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import Home from "../../pages/Home";
import ResetPassword from "../../pages/ResetPassword";
import PosterDashboard from "../../pages/PosterDashboard";
import PostFoodForm from "../post/PostFoodForm";

function NavAuth({ onOpenLogin, onOpenSignup, isMobile = false }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-32 animate-pulse bg-gray-200 rounded" />;
  }

  const firstName = user?.name?.split(" ")[0] ?? "";
  const displayName = firstName.length > 10 ? `${firstName.slice(0, 10)}...` : firstName;

  if (isAuthenticated) {
    return (
      <div className={`flex ${isMobile ? 'flex-col items-start w-full gap-4' : 'items-center gap-3'}`}>
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 text-sm font-medium text-dark hover:text-primary transition ${isMobile ? 'w-full px-4 py-2 bg-gray-50 rounded-xl' : ''}`}
        >
          <LayoutDashboard size={16} className="text-primary" />
          Dashboard
        </Link>
        <span className="hidden lg:block text-gray-300">|</span>
        <span className="font-medium text-dark text-sm">Hi, {displayName}</span>
        <button
          onClick={logout}
          className={`text-sm font-medium text-mid-gray hover:text-dark transition ${isMobile ? 'w-full text-left px-4 py-2 bg-gray-50 rounded-xl' : ''}`}
        >
          Log out
        </button>
        <button className={`${isMobile ? 'w-full' : 'hidden md:block'} bg-primary hover:bg-opacity-90 text-white px-5 py-2 rounded-xl font-medium shadow-sm transition`}>
          Post food
        </button>
      </div>
    );
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col w-full gap-3' : 'items-center gap-4'}`}>
      <button
        onClick={onOpenLogin}
        className={`flex items-center gap-2 text-dark font-medium hover:text-primary transition ${isMobile ? 'w-full px-4 py-2 bg-gray-50 rounded-xl' : ''}`}
      >
        <LogIn size={18} />
        <span className={isMobile ? "" : "hidden sm:inline"}>Log in</span>
      </button>
      <button
        onClick={onOpenSignup}
        className={`flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-dark px-4 py-2 rounded-xl font-medium shadow-sm transition ${isMobile ? 'w-full justify-center' : ''}`}
      >
        <UserPlus size={18} className="text-mid-gray" />
        <span className={isMobile ? "" : "hidden sm:inline"}>Sign up</span>
      </button>
      <button className={`${isMobile ? 'w-full' : 'hidden md:block'} bg-primary hover:bg-opacity-90 text-white px-5 py-2 rounded-xl font-medium shadow-sm transition`}>
        Post food
      </button>
    </div>
  );
}

function AppShell() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openLogin = () => {
    setMobileMenuOpen(false);
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setMobileMenuOpen(false);
    setShowLogin(false);
    setShowSignup(true);
  };

  const closeAll = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLoginSuccess = () => {
    closeAll();
    showToast("Welcome back! You're now logged in.");
  };

  const handleSignupSuccess = () => {
    closeAll();
    showToast("Account created! Welcome to FoodRescue.");
  };

  const navLinks = [
    { name: "How it works", href: "#how" },
    { name: "Live feed", href: "#feed" },
    { name: "Impact", href: "#impact" },
    { name: "Communities", href: "#communities" },
  ];

  const location = useLocation();
  const hideCenterNav = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-dark">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-full text-white group-hover:bg-opacity-90 transition">
                <UtensilsCrossed size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary hidden sm:block">FoodRescue</span>
            </Link>

            {/* Desktop Center Links */}
            {!hideCenterNav && (
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-mid-gray hover:text-dark transition"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            )}

            {/* Desktop Auth Actions & Mobile Hamburger */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center">
                <NavAuth onOpenLogin={openLogin} onOpenSignup={openSignup} />
              </div>
              <button
                className="lg:hidden p-2 text-dark"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-100 absolute top-20 left-0 w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {!hideCenterNav && navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-dark border-b border-gray-50"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-6 px-3">
                <NavAuth onOpenLogin={openLogin} onOpenSignup={openSignup} isMobile={true} />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<PosterDashboard />} />
          <Route path="/post" element={<PostFoodForm />} />
        </Routes>
      </main>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={closeAll}
          onSwitchToSignup={openSignup}
          onSuccess={handleLoginSuccess}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={closeAll}
          onSwitchToLogin={openLogin}
          onSuccess={handleSignupSuccess}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-dark text-white px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
          <CheckCircle2 size={18} className="text-accent shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-50 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
}

export default AppShell;
