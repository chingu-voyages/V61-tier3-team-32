import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UtensilsCrossed, LogIn, LogOut, UserPlus, LayoutDashboard, ChefHat, ShoppingBasket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginModal from './auth/LoginModal'
import SignupModal from './auth/SignupModal'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'signup'
  const location = useLocation()
  const navigate = useNavigate()

  const dashboardPath = user?.role === 'donor' ? '/posterdashboard' : '/claimdashboard'
  const isDashboard = location.pathname === dashboardPath

  const openAuth = (mode) => setAuthMode(mode)
  const closeAuth = () => setAuthMode(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="text-black md:p-4 p-3 shadow-md w-full overflow-x-auto scrollbar-hide">
      <div className="flex justify-center items-center gap-6 whitespace-nowrap min-w-max mx-auto px-4">

        {/* Logo group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-full text-white bg-primary place-items-center grid">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-primary font-bold text-sm md:text-xl">FoodRescue</span>
        </div>

        {/* Nav group */}
        <div className="flex flex-row items-center md:text-md text-sm gap-4 flex-shrink-0">
          <a href="#how-it-works" className="hover:text-primary hover:font-bold">How it works</a>
          <a href="#live-feed" className="hover:text-primary hover:font-bold">Live feed</a>
          <a href="#impact" className="hover:text-primary hover:font-bold">Impact</a>
          <a href="#communities" className="hover:text-primary hover:font-bold">Communities</a>

          {isDashboard ? (
            <div className="flex items-center gap-3">
              {user?.role === 'donor' ? (
                <ChefHat className="w-5 h-5 text-primary" />
              ) : (
                <ShoppingBasket className="w-5 h-5 text-primary" />
              )}
              <span className="font-semibold">Hi, {user?.name?.split(' ')[0]}</span>
              <span className="rounded-md bg-primary-light px-2 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {user?.role === 'donor' ? 'Poster' : 'Claimer'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center font-bold hover:bg-slate-200 p-1 md:p-1.5 hover:rounded-md gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
              <button className="flex items-center gap-2 rounded-md bg-primary p-1 md:p-1.5 text-white hover:font-bold hover:bg-green-900">
                <UtensilsCrossed className="w-5 h-5" />
                <span>Post food</span>
              </button>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold">Hey {user?.name?.split(' ')[0]}</span>
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 rounded-md border border-primary p-1 md:p-1.5 font-bold hover:bg-primary-light"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <button className="flex items-center gap-2 rounded-md bg-primary p-1 md:p-1.5 text-white hover:font-bold hover:bg-green-900">
                <UtensilsCrossed className="w-5 h-5" />
                <span>Post food</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center font-bold p-1 hover:rounded-md md:gap-4 gap-2">
              <button
                onClick={() => openAuth('login')}
                className="flex items-center font-bold hover:bg-slate-200 p-1 md:p-1.5 hover:rounded-md gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="flex items-center font-bold hover:bg-green-100 p-1 md:p-1.5 rounded-md gap-2 border border-primary"
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign up</span>
              </button>
              <button className="flex items-center gap-2 rounded-md bg-primary p-1 md:p-1.5 text-white hover:font-bold hover:bg-green-900">
                <UtensilsCrossed className="w-5 h-5" />
                <span>Post food</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {authMode === 'login' && (
        <LoginModal
          onClose={closeAuth}
          onSwitchToSignup={() => openAuth('signup')}
          onSuccess={closeAuth}
        />
      )}

      {authMode === 'signup' && (
        <SignupModal
          onClose={closeAuth}
          onSwitchToLogin={() => openAuth('login')}
          onSuccess={closeAuth}
        />
      )}
    </header>
  )
}

export default Header
