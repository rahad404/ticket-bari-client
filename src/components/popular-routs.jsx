'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, Train, Plane, Ship, ArrowRight, Clock, ShieldCheck, MapPin } from 'lucide-react';

const ROUTE_DATA = [
   // Bus Routes
   { id: 1, type: 'bus', from: 'Dhaka (Gabtoli)', to: 'Cox\'s Bazar', time: '10-12 hrs', price: 1300, operator: 'Hanif / Green Line', status: 'Available' },
   { id: 2, type: 'bus', from: 'Dhaka (Mohakhali)', to: 'Sylhet', time: '5.5 hrs', price: 750, operator: 'Ena Transport', status: 'Available' },
   { id: 3, type: 'Dhaka (Sayedabad)', type: 'bus', from: 'Dhaka', to: 'Khulna (Via Padma Bridge)', time: '4.5 hrs', price: 850, operator: 'Shohagh Scania', status: 'Fast Route' },

   // Train Routes
   { id: 4, type: 'train', from: 'Dhaka (Kamalapur)', to: 'Chittagong', time: '5 hrs', price: 825, operator: 'Suborno Express (701)', status: 'Snack Included' },
   { id: 5, type: 'train', from: 'Dhaka (Kamalapur)', to: 'Sylhet', time: '6.5 hrs', price: 680, operator: 'Parabat Express', status: 'Scenic Route' },
   { id: 6, type: 'train', from: 'Dhaka (Kamalapur)', to: 'Rajshahi', time: '4.5 hrs', price: 560, operator: 'Silkcity Express', status: 'Daily' },

   // Air Routes
   { id: 7, type: 'plane', from: 'Dhaka (HSIA)', to: 'Cox\'s Bazar', time: '1 hr', price: 4800, operator: 'Biman Bangladesh / US-Bangla', status: 'Popular' },
   { id: 8, type: 'plane', from: 'Dhaka (HSIA)', to: 'Saidpur', time: '55 mins', price: 3900, operator: 'Air Astra / Novoair', status: 'Business Class' },

   // Water/Launch Routes
   { id: 9, type: 'launch', from: 'Dhaka (Sadarghat)', to: 'Barisal', time: '8 hrs', price: 1200, operator: 'Kuakata-2 / Adventure-9', status: 'Double Cabin' },
];

export default function PopularRoutes() {
   const [activeTab, setActiveTab] = useState('bus');

   const filteredRoutes = activeTab === 'all'
      ? ROUTE_DATA
      : ROUTE_DATA.filter(route => route.type === activeTab);

   return (
      <section className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-y">
         <div className="max-w-6xl mx-auto px-4">

            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto mb-10">
               <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs mb-3 font-semibold">
                  Domestic Corridors
               </Badge>
               <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Popular Bangladeshi Routes
               </h2>
               <p className="text-muted-foreground text-sm mt-2">
                  Instantly check fares, operational durations, and luxury operator slots across national highways, rail lines, rivers, and flight zones.
               </p>
            </div>

            {/* Tab Controls Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
               <Button size="sm" variant={activeTab === 'bus' ? 'default' : 'outline'} onClick={() => setActiveTab('bus')} className="rounded-full text-xs font-semibold gap-1.5 px-4"><Bus className="h-3.5 w-3.5" /> Bus</Button>
               <Button size="sm" variant={activeTab === 'train' ? 'default' : 'outline'} onClick={() => setActiveTab('train')} className="rounded-full text-xs font-semibold gap-1.5 px-4"><Train className="h-3.5 w-3.5" /> Train</Button>
               <Button size="sm" variant={activeTab === 'plane' ? 'default' : 'outline'} onClick={() => setActiveTab('plane')} className="rounded-full text-xs font-semibold gap-1.5 px-4"><Plane className="h-3.5 w-3.5" /> Flight</Button>
               <Button size="sm" variant={activeTab === 'launch' ? 'default' : 'outline'} onClick={() => setActiveTab('launch')} className="rounded-full text-xs font-semibold gap-1.5 px-4"><Ship className="h-3.5 w-3.5" /> Water Launch</Button>
            </div>

            {/* Route Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredRoutes.map((route) => (
                  <Card key={route.id} className="overflow-hidden hover:shadow-md transition-all border border-muted group flex flex-col bg-card">
                     <CardContent className="p-5 flex-grow flex flex-col justify-between">

                        {/* Upper Frame Layout */}
                        <div>
                           <div className="flex justify-between items-center mb-3">
                              <Badge variant="secondary" className="capitalize text-[10px] tracking-wider font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                                 {route.type}
                              </Badge>
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-none">
                                 {route.status}
                              </span>
                           </div>

                           {/* Locations Mapping Row */}
                           <div className="flex items-center gap-2 text-foreground font-bold text-base py-1.5">
                              <span className="truncate max-w-[110px] flex items-center gap-1"><MapPin className="h-3 w-3 text-red-500 shrink-0" />{route.from.split(' ')[0]}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-60 group-hover:translate-x-1 transition-transform" />
                              <span className="truncate max-w-[110px] text-primary">{route.to}</span>
                           </div>

                           <p className="text-xs text-muted-foreground font-medium mt-1 mb-4">
                              via {route.operator}
                           </p>
                        </div>

                        {/* Lower Price/Time Row */}
                        <div className="pt-3 border-t flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 -mx-5 -mb-5 p-5 mt-auto">
                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{route.time}</span>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] block text-muted-foreground uppercase tracking-wider font-medium">Starting from</span>
                              <span className="text-lg font-black text-foreground">৳{route.price.toLocaleString()}</span>
                           </div>
                        </div>

                     </CardContent>
                  </Card>
               ))}
            </div>

         </div>
      </section>
   );
}