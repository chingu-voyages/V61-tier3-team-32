import HeroSection from "../components/home/HeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import LiveFeedSection from "../components/home/LiveFeedSection";
import ImpactSection from "../components/home/ImpactSection";
import CommunitiesSection from "../components/home/CommunitiesSection";
import { Github, Linkedin, UtensilsCrossed } from "lucide-react";

export default function Home() {
  const teamMembers = [
    { name: "Ruthigwe Oruta", github: "https://github.com/Xondacc", linkedin: "https://linkedin.com/in/ruthigwe-oruta" },
    { name: "Daniele Kafriyie", github: "https://github.com/dk-afriyie", linkedin: "https://linkedin.com/in/danielkafriyie/" },
    { name: "David Akanang", github: "https://github.com/DavidBugger", linkedin: "https://linkedin.com/in/david-akanang-0789771a4" },
    { name: "Bathshua", github: "https://github.com/bathshuabradley", linkedin: "https://linkedin.com/in/Awsomgal/" },
    { name: "Alwin Puche", github: "https://github.com/awyyyn", linkedin: "https://linkedin.com/in/alwin-puche-7295851b7/" },
    { name: "Anderson Osayerie", github: "https://github.com/andersonosayerie", linkedin: "https://linkedin.com/in/anderson-osayerie" },
    { name: "Jonathan", github: "https://github.com/jnini2076e", linkedin: "https://www.linkedin.com/in/jonathan-padilla7/" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <LiveFeedSection />
      <ImpactSection />
      <CommunitiesSection />

      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-12">

            {/* Left Column */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-1.5 rounded-full text-white">
                  <UtensilsCrossed size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-dark">FoodRescue</span>
              </div>
              <p className="text-mid-gray text-sm leading-relaxed">
                Don't waste it. Share it. Built with care for communities across Nigeria.
              </p>
            </div>

            {/* Right Column: Built By Grid */}
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">BUILT BY</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4">
                {teamMembers.map((member) => (
                  <div key={member.name} className="flex items-center gap-2">
                    <span className="text-sm text-dark">{member.name}</span>
                    <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition">
                      <a href={member.github} target="_blank" rel="noreferrer" className="hover:text-primary transition" title={`${member.name} GitHub`}>
                        <Github size={12} />
                      </a>
                      <a href={member.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#0077b5] transition" title={`${member.name} LinkedIn`}>
                        <Linkedin size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm text-mid-gray">
              © 2026 FoodRescue · Voyage team 32 · Built for Nigeria.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
