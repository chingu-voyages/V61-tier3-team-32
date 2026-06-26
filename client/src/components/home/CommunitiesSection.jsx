import { Map } from "lucide-react";

export default function CommunitiesSection() {
  const regions = [
    {
      title: "Lagos & the South-West",
      cities: "Lagos · Ibadan · Abeokuta",
      description: "Connecting bukas, bakeries and event caterers with families in the same LGA.",
    },
    {
      title: "Abuja & Beyond",
      cities: "Abuja · Port Harcourt · Kano · Enugu",
      description: "Hotels, restaurants and home kitchens passing on surplus to neighbours nearby.",
    }
  ];

  return (
    <section className="py-20 bg-white" id="communities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-4">Built for our communities</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-dark mb-6 tracking-tight">Rooted in Nigeria.</h3>
          <p className="text-lg text-mid-gray leading-relaxed">
            A country where surplus and need live a few streets apart. FoodRescue is designed for the way food actually moves in our neighbourhoods. It's mobile-first, low-data, and built around the clock that matters: expiry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regions.map((region, index) => (
            <div key={index} className="bg-[#FAFAFA] rounded-3xl p-8 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Decorative NG Badge */}
              <div className="absolute top-8 right-8 text-6xl font-black text-gray-200/50 pointer-events-none select-none">
                NG
              </div>
              <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/3 w-48 h-48 bg-primary-light/40 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-dark mb-2">{region.title}</h4>
                <p className="text-primary font-medium text-sm mb-4">{region.cities}</p>
                <p className="text-mid-gray leading-relaxed">{region.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA block */}
        <div className="mt-16 bg-gradient-to-r from-primary to-[#D68A59] rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#1a1a1a] tracking-tight">
              Got food that won't be eaten<br className="hidden md:block" /> tonight?
            </h3>
            <p className="text-white/90 mb-10 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Post it in two minutes. Someone nearby will be grateful — and the planet will breathe a little easier.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button className="w-full sm:w-auto bg-white text-dark hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold shadow-sm transition">
                Post food now
              </button>
              <button className="w-full sm:w-auto bg-transparent border-2 border-white/80 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-bold transition">
                Browse the feed
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
