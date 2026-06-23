import { ArrowRight, UtensilsCrossed, Leaf, Users, HandHeart } from "lucide-react";

export default function ImpactSection() {
  const stats = [
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-primary" />,
      number: "12,480",
      label: "Meals rescued"
    },
    {
      icon: <Leaf className="w-6 h-6 text-primary" />,
      number: "4,320 kg",
      label: "Food saved"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      number: "286",
      label: "Active donors"
    },
    {
      icon: <HandHeart className="w-6 h-6 text-primary" />,
      number: "98%",
      label: "Pickup success"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-[#E8F5E9]" id="impact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Text */}
          <div className="max-w-xl">
            <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-4">Community impact</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-dark mb-6 tracking-tight leading-tight">
              Every rescued meal counts, and we count every one.
            </h3>
            <p className="text-lg text-mid-gray mb-10 leading-relaxed">
              Together, the FoodRescue community across Nigeria has stopped thousands of kilograms of food from being wasted, and turned it into meals for the people next door.
            </p>
            <button className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-3.5 rounded-xl font-medium shadow-sm transition">
              See full impact
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-6">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-primary mb-2 tracking-tight">{stat.number}</div>
                <div className="text-mid-gray font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
