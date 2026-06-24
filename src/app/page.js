import HeroSection from "@/components/hero-section";
import PopularRoutes from "@/components/popular-routs";
import LatestTickets from "@/components/latest-tickets";
import AdvertisedTickets from "@/components/advertised-tickets";
import WhyChooseUs from "@/components/why-choose-us";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <PopularRoutes />
      <LatestTickets />
      <AdvertisedTickets />
      <WhyChooseUs />
    </div>
  );
}
