'use client';
import React from 'react';
import { ShieldCheck, Zap, HelpCircle, BadgeCheck, Users, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
   {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      title: "100% Verified Vendors",
      desc: "Every fleet operator, airline liaison, and river launch service undergoes systematic administrative background checks and regulatory screening to filter fraud completely."
   },
   {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: "Real-Time Seat Allotments",
      desc: "Direct API pipelines into Bangladeshi transit systems mean no double-bookings. Get synchronized live cabin, berth, or seat charts instantly."
   },
   {
      icon: <Banknote className="h-6 w-6 text-blue-500" />,
      title: "Transparent Pricing Infrastructure",
      desc: "Zero hidden gateway convenience margins. Check out using bKash, Nagad, Visa, or Mastercard matching standard off-counter transport tariffs exactly."
   },
   {
      icon: <Users className="h-6 w-6 text-indigo-500" />,
      title: "Unified Corporate Operations",
      desc: "Manage personal vacations, family group bookings, or enterprise employee logisticts under one dashboard tracking history across bus, train, water, and air paths."
   },
   {
      icon: <BadgeCheck className="h-6 w-6 text-purple-500" />,
      title: "Instant Digital Gatepasses",
      desc: "Say goodbye to counter lines. Receive official, digitally signed SMS and secure PDF boarding barcodes matching exact terminal entry parameters."
   },
   {
      icon: <HelpCircle className="h-6 w-6 text-rose-500" />,
      title: "Local 24/7 Priority Support",
      desc: "Our localized support desk manages real-time emergency trip amendments, unexpected schedule cancellations, or immediate operator routing coordination."
   }
];

export default function WhyChooseUs() {
   return (
      <section className="py-20 bg-background">
         <div className="max-w-6xl mx-auto px-4">

            {/* Section Heading */}
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
               <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-xs font-semibold mb-3">
                  Platform Benefits
               </Badge>
               <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Engineered for Flawless Travel Management
               </h2>
               <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-2xl">
                  Discover why thousands of Bangladeshi commuters, leisure tourists, and enterprise organizations choose our unified infrastructure to manage daily inter-district transit lines.
               </p>
            </div>

            {/* Features Card Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {FEATURES.map((feat, index) => (
                  <div
                     key={index}
                     className="flex flex-col p-6 rounded-2xl border bg-card hover:bg-slate-50/40 dark:hover:bg-slate-900/20 hover:shadow-sm transition-all duration-200"
                  >
                     {/* Icon Container */}
                     <div className="p-2.5 bg-muted/50 rounded-xl w-fit mb-4 border border-muted">
                        {feat.icon}
                     </div>

                     {/* Feature Text Content */}
                     <h3 className="text-base font-bold text-foreground mb-2">
                        {feat.title}
                     </h3>
                     <p className="text-xs text-muted-foreground leading-relaxed">
                        {feat.desc}
                     </p>
                  </div>
               ))}
            </div>

         </div>
      </section>
   );
}