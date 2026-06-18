import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UtensilsCrossed, LogIn, LogOut, UserPlus, LayoutDashboard, ChefHat } from 'lucide-react'
import AuthModal from './AuthModal'

const Header = ({ user, onAuthSuccess }) => {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const location = useLocation()
  const navigate = useNavigate()
  const isDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    if (isDashboard && !user) {
      onAuthSuccess({ id: 'poster-ruth', firstName: 'Ruth', role: 'poster' })
    }
  }, [isDashboard, user, onAuthSuccess])

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const handleAuthSuccess = (authedUser) => {
    onAuthSuccess(authedUser)
    setAuthOpen(false)
  }

  const handleLogout = () => {
    onAuthSuccess(null)
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
              <ChefHat className="w-5 h-5 text-primary" />
              <span className="font-semibold">Hi, {user?.firstName ?? 'Ruth'}</span>
              <span className="rounded-md bg-primary-light px-2 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                Poster
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
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold">Hey {user.firstName}</span>
              <Link
                to="/dashboard"
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

      <AuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  )
}

export default Header
