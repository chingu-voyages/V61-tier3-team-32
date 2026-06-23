import { PlusCircle, Search, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary font-semibold text-sm mb-6"
            >
              <MapPin size={16} />
              LIVE ACROSS NIGERIA
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-dark mb-6 leading-tight"
            >
              Don't waste it.<br />
              <span className="text-primary">Share it.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg text-mid-gray mb-8 leading-relaxed max-w-lg"
            >
              FoodRescue is the fastest way for restaurants, bakeries and home kitchens across Lagos, Abuja, Port Harcourt and beyond to pass on surplus meals to neighbours before the clock runs out.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <button className="flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-white px-6 py-3.5 rounded-xl font-medium shadow-sm transition">
                <PlusCircle size={20} />
                Post surplus food
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-dark px-6 py-3.5 rounded-xl font-medium shadow-sm transition">
                <Search size={20} />
                Find food near me
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-6 text-sm font-medium text-gray-600"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                42 listings live now
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-urgency fill-urgency" />
                4.8 community rating
              </div>
            </motion.div>
          </div>

          {/* Image & Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-[400px] lg:h-[500px]"
          >
            <img
              src="hero.jpg?q=80&w=4000&auto=format&fit=crop"
              alt="People sharing a meal"
              className="w-full h-full object-cover rounded-3xl shadow-xl"
            />

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring", bounce: 0.4 }}
              className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex gap-4 items-center"
            >
              <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                <PlusCircle size={24} />
              </div>
              <div>
                <p className="font-bold text-dark text-sm">Just rescued</p>
                <p className="text-mid-gray text-xs leading-snug mt-0.5">Adaeze claimed 4 plates in Yaba, Lagos · 2 min ago</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary-light/40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
    </section>
  );
}
