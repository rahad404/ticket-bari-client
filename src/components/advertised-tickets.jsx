'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, Train, Plane, Ship, MapPin, Eye, Ticket, Users, Megaphone } from 'lucide-react';

const PERK_LABELS = {
   ac: 'AC',
   breakfast: 'Breakfast',
   wifi: 'Wi-Fi',
   blanket: 'Blanket',
   charging: 'Charging',
};

const getTransportBadge = (type) => {
   switch (type?.toLowerCase()) {
      case 'bus':
         return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"><Bus className="h-3 w-3 mr-1" />Bus</Badge>;
      case 'train':
         return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400"><Train className="h-3 w-3 mr-1" />Train</Badge>;
      case 'air':
      case 'plane':
         return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400"><Plane className="h-3 w-3 mr-1" />Flight</Badge>;
      default:
         return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400"><Ship className="h-3 w-3 mr-1" />Launch</Badge>;
   }
};

export default function AdvertisedTickets() {
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchAdvertised = async () => {
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/advertised`);
            if (!response.ok) throw new Error('Failed to fetch advertised tickets');
            const data = await response.json();
            setTickets(Array.isArray(data) ? data : []);
         } catch (error) {
            console.error(error);
            setTickets([]);
         } finally {
            setLoading(false);
         }
      };
      fetchAdvertised();
   }, []);

   if (loading) {
      return (
         <section className="py-16 bg-muted/30">
            <div className="max-w-6xl mx-auto px-4">
               <div className="text-center max-w-2xl mx-auto mb-10">
                  <Skeleton className="h-5 w-24 mx-auto mb-3 rounded-full" />
                  <Skeleton className="h-9 w-64 mx-auto mb-2" />
                  <Skeleton className="h-4 w-80 mx-auto" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                     <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-[16/9] w-full rounded-none" />
                        <CardContent className="p-4 space-y-3">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                           <div className="flex gap-1">
                              <Skeleton className="h-5 w-12 rounded-full" />
                              <Skeleton className="h-5 w-16 rounded-full" />
                           </div>
                           <div className="flex justify-between pt-2 border-t">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-6 w-16" />
                           </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                           <Skeleton className="h-10 w-full rounded-md" />
                        </CardFooter>
                     </Card>
                  ))}
               </div>
            </div>
         </section>
      );
   }

   if (tickets.length === 0) return null;

   return (
      <section className="py-16 bg-muted/30 border-y">
         <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
               <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-1 text-xs mb-3 font-semibold">
                  <Megaphone className="h-3 w-3 mr-1" />
                  Featured
               </Badge>
               <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Advertised Tickets
               </h2>
               <p className="text-muted-foreground text-sm mt-2">
                  Hand-picked top deals selected by our administrators. Don&apos;t miss out on these featured journeys.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tickets.map((ticket) => (
                  <Card key={ticket._id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border border-muted group relative">
                     <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none text-[10px] px-2 py-0.5">
                           <Megaphone className="h-3 w-3 mr-1" />
                           Featured
                        </Badge>
                     </div>
                     <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                        {ticket.imageUrl ? (
                           <img
                              src={ticket.imageUrl}
                              alt={ticket.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                           />
                        ) : (
                           <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Ticket className="h-10 w-10 opacity-30" />
                           </div>
                        )}
                     </div>
                     <CardContent className="flex-1 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                           <h3 className="font-bold text-sm leading-tight line-clamp-1">{ticket.title || 'Untitled Ticket'}</h3>
                           {getTransportBadge(ticket.transportType)}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                           <MapPin className="h-3 w-3 shrink-0" />
                           <span className="font-medium text-foreground">{ticket.from || 'N/A'}</span>
                           <span>→</span>
                           <span className="font-medium text-primary">{ticket.to || 'N/A'}</span>
                        </div>

                        {ticket.perks?.length > 0 && (
                           <div className="flex flex-wrap gap-1">
                              {ticket.perks.map((perk) => (
                                 <Badge key={perk} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                    {PERK_LABELS[perk] || perk}
                                 </Badge>
                              ))}
                           </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                           <div>
                              <span className="text-base font-bold">${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'}</span>
                           </div>
                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{ticket.quantity ?? 0}</span>
                           </div>
                        </div>
                     </CardContent>
                     <CardFooter className="p-4 pt-0">
                        <Link href={`/all-tickets/${ticket._id}`} className="w-full">
                           <Button variant="default" size="sm" className="w-full cursor-pointer text-xs">
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              See Details
                           </Button>
                        </Link>
                     </CardFooter>
                  </Card>
               ))}
            </div>
         </div>
      </section>
   );
}
