'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, Train, Plane, Ship, Calendar, MapPin, Eye, Search, AlertCircle, Ticket, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

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

export default function AllTicketsPage() {
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [transportType, setTransportType] = useState('all');
   const [sort, setSort] = useState('');

   const fetchTickets = useCallback(async (searchTerm, type, sortBy) => {
      try {
         setLoading(true);
         const params = new URLSearchParams();
         if (searchTerm?.trim()) params.set('search', searchTerm.trim());
         if (type && type !== 'all') params.set('transportType', type);
         if (sortBy) params.set('sort', sortBy);

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets?${params.toString()}`);
         if (!response.ok) throw new Error('Failed to fetch tickets');
         const data = await response.json();
         setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error(error);
         toast.error('Failed to load tickets');
         setTickets([]);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      const timer = setTimeout(() => fetchTickets(search, transportType, sort), 400);
      return () => clearTimeout(timer);
   }, [search, transportType, sort, fetchTickets]);

   return (
      <div className="min-h-svh py-8 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
         <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
            <p className="text-muted-foreground text-sm">Browse approved transport tickets from our verified vendors.</p>
         </div>

         <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Search by route or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
               />
            </div>
            <Select value={transportType} onValueChange={setTransportType}>
               <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Transport Type" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="air">Flight</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
               </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
               <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="">Latest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
               </SelectContent>
            </Select>
         </div>

         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                     <Skeleton className="aspect-[16/9] w-full rounded-none" />
                     <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
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
         ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
               <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
               <h3 className="text-lg font-semibold">No tickets found</h3>
               <p className="text-sm text-muted-foreground max-w-sm mt-1">Try adjusting your search or filter criteria to find available tickets.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tickets.map((ticket) => (
                  <Card key={ticket._id} className="overflow-hidden flex flex-col">
                     <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                        {ticket.imageUrl ? (
                           <img
                              src={ticket.imageUrl}
                              alt={ticket.title}
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                           />
                        ) : (
                           <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Ticket className="h-12 w-12 opacity-30" />
                           </div>
                        )}
                     </div>
                     <CardContent className="flex-1 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                           <h3 className="font-bold text-base leading-tight line-clamp-1">{ticket.title || 'Untitled Ticket'}</h3>
                           {getTransportBadge(ticket.transportType)}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm">
                           <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                           <span className="font-medium">{ticket.from || 'N/A'}</span>
                           <span className="text-muted-foreground">→</span>
                           <span className="font-medium text-primary">{ticket.to || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                           <Calendar className="h-3.5 w-3.5 shrink-0" />
                           <span>{ticket.departureDateTime ? new Date(ticket.departureDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Flexible'}</span>
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
                              <span className="text-lg font-bold">${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'}</span>
                              <span className="text-xs text-muted-foreground ml-1">/ seat</span>
                           </div>
                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>{ticket.quantity ?? 0} left</span>
                           </div>
                        </div>
                     </CardContent>
                     <CardFooter className="p-4 pt-0">
                        <Link href={`/all-tickets/${ticket._id}`} className="w-full">
                           <Button variant="default" className="w-full cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              See Details
                           </Button>
                        </Link>
                     </CardFooter>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );
}
