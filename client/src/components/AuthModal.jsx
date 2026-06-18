import { useState } from 'react'
import { LogIn, UserPlus, ChefHat, ShoppingBasket, X } from 'lucide-react'
import { mockUser } from '../data/mockData'

const ROLE_OPTIONS = [
  { value: 'poster', label: 'Post food', desc: 'Share surplus from my kitchen', icon: ChefHat },
  { value: 'claimer', label: 'Claim food', desc: 'Find meals near me', icon: ShoppingBasket },
]

const EMPTY_FORM = { name: '', email: '', password: '', role: 'claimer' }

const AuthModal = ({ open, mode, onModeChange, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  if (!open) return null

  const isSignup = mode === 'signup'

  const switchMode = () => {
    setError('')
    onModeChange(isSignup ? 'login' : 'signup')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim() || (isSignup && !form.name.trim())) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    onSuccess({
      id: mockUser.id,
      firstName: isSignup ? form.name.trim().split(' ')[0] : mockUser.firstName,
      role: isSignup ? form.role : mockUser.role,
    })
    setForm(EMPTY_FORM)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2 text-primary">
            {isSignup ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            <h2 className="text-lg font-bold text-dark">
              {isSignup ? 'Create your account' : 'Log in to FoodRescue'}
            </h2>
          </div>
          <button onClick={onClose} className="text-mid-gray hover:text-dark">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-mid-gray">
          {isSignup
            ? 'Join the community to post surplus and claim meals nearby.'
            : 'Welcome back — claim or post food in your area.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-1.5">
              <label htmlFor="auth-name" className="text-sm font-semibold text-dark">Full name *</label>
              <input
                id="auth-name"
                placeholder="Adaeze Okonkwo"
                value={form.name}
                maxLength={60}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {isSignup && (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-dark">I want to *</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const selected = form.role === option.value
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setForm({ ...form, role: option.value })}
                      className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition ${
                        selected ? 'border-primary bg-primary-light' : 'border-light-gray hover:border-primary/40'
                      }`}
                    >
                      <option.icon className={`h-5 w-5 ${selected ? 'text-primary' : 'text-mid-gray'}`} />
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="text-[11px] text-mid-gray">{option.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="text-sm font-semibold text-dark">Email *</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              maxLength={120}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="text-sm font-semibold text-dark">Password *</label>
            <input
              id="auth-password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              maxLength={120}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-light-gray px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-900"
            >
              {isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {isSignup ? 'Sign up' : 'Log in'}
            </button>
            <button
              type="button"
              onClick={switchMode}
              className="text-center text-sm text-mid-gray hover:text-dark"
            >
              {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
