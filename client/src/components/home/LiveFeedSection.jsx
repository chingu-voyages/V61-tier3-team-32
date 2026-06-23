import { Clock, MapPin, Star } from "lucide-react";

export default function LiveFeedSection() {
  const filters = ["All", "Lagos", "Abuja", "Port Harcourt", "Ibadan"];

  const feedItems = [
    {
      category: "Hot Meal",
      timeBg: "bg-urgency/10 text-urgency",
      timeLeft: "42m left",
      title: "Fresh Jollof Rice & Vegetables",
      source: "Mama Ada's Kitchen",
      quantity: "Serves 6",
      distance: "1.2 km",
      location: "Lagos, Nigeria",
      rating: "4.8"
    },
    {
      category: "Hot Meal",
      timeBg: "bg-urgency text-white",
      timeLeft: "18m left",
      title: "Egusi Soup & Pounded Yam",
      source: "Chop Life Buka",
      quantity: "10 plates",
      distance: "0.6 km",
      location: "Port Harcourt, Nigeria",
      rating: "4.9"
    },
    {
      category: "Bakery",
      timeBg: "bg-primary text-white",
      timeLeft: "2h 55m left",
      title: "End-of-day Breads & Pastries",
      source: "Crust & Crumb Bakery",
      quantity: "20+ items",
      distance: "2.8 km",
      location: "Abuja, Nigeria",
      rating: "4.7"
    }
  ];

  return (
    <section className="py-20 bg-[#FAFAFA]" id="feed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-2">Live feed</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">Available right now near you</h3>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide">
          {filters.map((filter, index) => (
            <button
              key={filter}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition ${index === 0
                ? "bg-primary text-white"
                : "bg-white text-mid-gray border border-gray-200 hover:border-primary/50"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedItems.map((item, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                  {item.category}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${item.timeBg}`}>
                  <Clock size={14} />
                  {item.timeLeft}
                </span>
              </div>

              <h4 className="text-xl font-bold text-dark mb-2">{item.title}</h4>
              <p className="text-mid-gray text-sm mb-6">
                {item.source} · {item.quantity}
              </p>

              <div className="flex items-center justify-between text-sm text-mid-gray mb-8">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary" />
                  {item.distance} · {item.location}
                </div>
                <div className="flex items-center gap-1 font-medium text-dark">
                  <Star size={16} className="text-urgency fill-urgency" />
                  {item.rating}
                </div>
              </div>

              <button className="mt-auto w-full bg-primary hover:bg-opacity-90 text-white font-medium py-3 rounded-xl transition">
                Claim this food
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
