"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Ticket, Users, Plane } from "lucide-react";
import RadialCarousel from './radial-carosel'

const stats = [
  {
    icon: MapPin,
    label: "Destinations",
    value: "100+",
  },
  {
    icon: Ticket,
    label: "Tickets Booked",
    value: "5K+",
  },
  {
    icon: Users,
    label: "Happy Travelers",
    value: "2K+",
  },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="bg-primary/10 absolute top-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Badge
              variant="secondary"
              className="rounded-full text-primary px-2 py-3 text-sm"
            >
              <Plane className="w-4 h-4 mr-1 inline" />
              Your Journey Starts Here
            </Badge>

            <div className="space-y-5">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Book Your Next Adventure,
                <span className="text-primary block mt-2">
                  Anywhere, Anytime
                </span>
              </h1>

              <p className="text-muted-foreground max-w-xl text-base leading-7 md:text-lg">
                Discover and book bus, train, launch, and flight tickets with
                ease. Compare prices, check availability, and travel smart.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/all-tickets">Browse Tickets</Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard/vendor/add-ticket">List Your Tickets</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 grid-cols-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card border rounded-2xl p-4 shadow-sm lg:flex">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-xl p-2">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{value}</h3>
                      <p className="text-muted-foreground text-sm">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex justify-center"
          >
            <RadialCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;