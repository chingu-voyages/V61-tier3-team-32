import { Plus, Search, HandHeart } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "STEP 1",
      title: "Post the surplus",
      description: "Snap a photo, set quantity and a pickup window. Your listing goes live for neighbours within seconds.",
      icon: <Plus className="w-6 h-6 text-primary" />
    },
    {
      step: "STEP 2",
      title: "Neighbours discover it",
      description: "Claimers browse a live feed and map, filtered by distance and category, colour-coded by urgency.",
      icon: <Search className="w-6 h-6 text-primary" />
    },
    {
      step: "STEP 3",
      title: "Pickup & rate",
      description: "One-tap claim locks it instantly. After pickup, a quick rating keeps the community honest.",
      icon: <HandHeart className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <section className="py-20 bg-white" id="how">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-4">How it works</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-dark mb-6 tracking-tight">Post in 2 minutes. Claim in 3 taps.</h3>
          <p className="text-lg text-mid-gray leading-relaxed">
            Built for the way kitchens actually run: fast, mobile-first, and honest about expiry times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="bg-[#F8F9FA] rounded-3xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-sm font-semibold tracking-wider text-gray-500">{item.step}</span>
              </div>
              <h4 className="text-xl font-bold text-dark mb-4">{item.title}</h4>
              <p className="text-mid-gray leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
