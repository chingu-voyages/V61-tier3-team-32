import { LayoutDashboard, ShoppingBasket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ClaimDashboard = () => {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="min-h-screen bg-primary-light">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-[10px] md:text-md font-bold uppercase tracking-wide text-primary">
          <LayoutDashboard className="h-3 w-3 md:h-5 md:w-5" /> claimer dashboard
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-dark sm:text-4xl">
          Welcome, {firstName} - find food near you
        </h1>

        <div className="mt-8 rounded-2xl border border-dashed border-light-gray bg-white p-8 text-center text-mid-gray">
          <ShoppingBasket className="mx-auto mb-3 h-10 w-10 text-primary/40" />
          <p className="font-semibold text-dark">Claimer dashboard coming soon</p>
          <p className="mt-1 text-sm text-mid-gray">
            Soon you'll be able to browse nearby listings and claim surplus food here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClaimDashboard
