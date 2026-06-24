import HeroSection, { JobHero } from "@/components/hero-section";
import PopularRoutes from "@/components/popular-routs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";
import WhyChooseUs from "@/components/why-choose-us";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <PopularRoutes />
      <WhyChooseUs />
    </div>
  );
}
