import { UtensilsCrossed } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-10">

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

       
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full text-white bg-primary place-items-center grid">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-semibold text-primary">FoodRescue</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Don't waste it. Share it. Built with care for communities across Nigeria.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Built by
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 sm:grid-cols-3">
              {[
                "Ruth Oruta",
                "Daniel",
                "Devdave",
                "Bathshua",
                "Alwyn",
                "Anderson",
                "Jonathan Padilla",
              ].map((name) => (
                <li key={name} className="py-0.5">{name}</li>
              ))}
            </ul>
          </div>

        </div>

        
        <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500">
          © 2026 FoodRescue · Voyage team 32 · Built for Nigeria.
        </div>

      </div>
    </footer>
  )
}

export default Footer