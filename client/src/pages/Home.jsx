import HeroSection from "../components/home/HeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import LiveFeedSection from "../components/home/LiveFeedSection";
import ImpactSection from "../components/home/ImpactSection";
import CommunitiesSection from "../components/home/CommunitiesSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <LiveFeedSection />
      <ImpactSection />
      <CommunitiesSection />
    </div>
  );
}
