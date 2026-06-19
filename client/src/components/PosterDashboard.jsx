import { useState } from 'react'
import {
  ChefHat,
  Clock,
  HandHeart,
  LayoutDashboard,
  Leaf,
  PlusCircle,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react'
import { mockPosterListings, mockPosterStats } from '../data/mockData'

function urgencyClass(status, minutesLeft) {
  if (status === 'expired' || minutesLeft <= 0) return 'bg-danger text-white'
  if (minutesLeft < 60) return 'bg-urgency text-white'
  return 'bg-primary text-white'
}

function countdownLabel(status, minutesLeft) {
  if (status === 'expired' || minutesLeft <= 0) return 'Expired'
  if (minutesLeft < 60) return `${minutesLeft}m left`
  const hours = Math.floor(minutesLeft / 60)
  const minutes = minutesLeft % 60
  return minutes ? `${hours}h ${minutes}m left` : `${hours}h left`
}

const PosterDashboard = ({ user }) => {
  const [listings, setListings] = useState(mockPosterListings)
  const firstName = user?.firstName ?? 'Jonathan'

  const cancelListing = (id) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id))
  }

  const stats = [
    { icon: UtensilsCrossed, label: 'Active listings', value: mockPosterStats.activeListings },
    { icon: HandHeart, label: 'Claimed today', value: mockPosterStats.claimedToday },
    { icon: Leaf, label: 'Total donated', value: mockPosterStats.totalDonated },
  ]

  return (
    <div className="min-h-screen bg-primary-light">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-[10px] md:text-md font-bold uppercase tracking-wide text-primary">
              <LayoutDashboard className="h-3 w-3 md:h-5 md:w-5" /> poster dashboard
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-dark sm:text-4xl">
              Welcome, {firstName} - manage your listings
            </h1>
            <p className="mt-1 text-mid-gray">
              Post surplus food, track your kitchen, and tracks who claims it.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:opacity-95">
            <PlusCircle className="h-4 w-4" /> Post new food
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-light-gray bg-white p-5 shadow-sm">
              <stat.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="text-xs uppercase tracking-wide text-mid-gray">{stat.label}</p>
              <p className="text-2xl font-extrabold text-dark">{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-3 text-lg font-bold text-dark">Your listings</h2>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-light-gray bg-white p-8 text-center text-mid-gray">
            <ChefHat className="mx-auto mb-3 h-10 w-10 text-primary/40" />
            <p className="font-semibold text-dark">No listings yet</p>
            <p className="mt-1 text-sm text-mid-gray">Click "Post new food" to share your first surplus meal.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  listing.claimedBy ? 'border-primary/60 ring-1 ring-primary/30' : 'border-light-gray'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-light-gray px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mid-gray">
                    {listing.category}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${urgencyClass(listing.status, listing.expiresInMin)}`}>
                    <Clock className="mr-1 inline h-3 w-3" />
                    {countdownLabel(listing.status, listing.expiresInMin)}
                  </span>
                </div>

                <h3 className="font-bold text-dark">{listing.title}</h3>
                <p className="text-xs text-mid-gray">{listing.quantity}</p>

                {listing.claimedBy ? (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-light px-2.5 py-2 text-xs font-semibold text-primary">
                    Claimed by {listing.claimedBy}
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-light-gray px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-mid-gray">
                    <span className="h-1.5 w-1.5 rounded-full bg-urgency" /> Awaiting claim
                  </div>
                )}

                <button
                  onClick={() => cancelListing(listing.id)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel listing
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PosterDashboard
