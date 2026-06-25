'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, Train, Plane, Ship, Calendar, MapPin, Eye, Search, AlertCircle, Ticket, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
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
const ITEMS_PER_PAGE = 6;

export default function AllTicketsPage() {
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [totalCount, setTotalCount] = useState(0);
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState('');
   const [from, setFrom] = useState('');
   const [to, setTo] = useState('');
   const [transportType, setTransportType] = useState('all');
   const [sort, setSort] = useState('');

   const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

   const fetchTickets = useCallback(async (searchTerm, fromTerm, toTerm, type, sortBy, pageNum) => {
      try {
         setLoading(true);
         const params = new URLSearchParams();
         if (searchTerm?.trim()) params.set('search', searchTerm.trim());
         if (fromTerm?.trim()) params.set('from', fromTerm.trim());
         if (toTerm?.trim()) params.set('to', toTerm.trim());
         if (type && type !== 'all') params.set('transportType', type);
         if (sortBy) params.set('sort', sortBy);
         params.set('page', String(pageNum));
         params.set('limit', String(ITEMS_PER_PAGE));

         const [ticketsRes, countRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets?${params.toString()}`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets-count?${params.toString()}`),
         ]);

         if (!ticketsRes.ok) throw new Error('Failed to fetch tickets');
         if (!countRes.ok) throw new Error('Failed to fetch count');

         const data = await ticketsRes.json();
         const { count } = await countRes.json();
         setTickets(Array.isArray(data) ? data : []);
         setTotalCount(count ?? 0);
      } catch (error) {
         console.error(error);
         toast.error('Failed to load tickets');
         setTickets([]);
         setTotalCount(0);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      const timer = setTimeout(() => fetchTickets(search, from, to, transportType, sort, page), 400);
      return () => clearTimeout(timer);
   }, [search, from, to, transportType, sort, page, fetchTickets]);

   const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const handleSearchChange = (val) => {
      setSearch(val);
      setPage(1);
   };
   const handleFromChange = (val) => {
      setFrom(val);
      setPage(1);
   };
   const handleToChange = (val) => {
      setTo(val);
      setPage(1);
   };
   const handleTransportChange = (val) => {
      setTransportType(val);
      setPage(1);
   };
   const handleSortChange = (val) => {
      setSort(val);
      setPage(1);
   };

   return (
      <div className="min-h-svh py-8 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
         <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
            <p className="text-muted-foreground text-sm">Browse approved transport tickets from our verified vendors.</p>
         </div>

         <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by title..." value={search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9" />
               </div>
               <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="From (location)..." value={from} onChange={(e) => handleFromChange(e.target.value)} className="pl-9" />
               </div>
               <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="To (location)..." value={to} onChange={(e) => handleToChange(e.target.value)} className="pl-9" />
               </div>
               <div className="flex gap-3">
                  <Select value={transportType} onValueChange={handleTransportChange}>
                     <SelectTrigger className="flex-1">
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
                  <Select value={sort} onValueChange={handleSortChange}>
                     <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sort by" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="">Latest</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
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
            <>
               <p className="text-sm text-muted-foreground">{totalCount} ticket{totalCount !== 1 ? 's' : ''} found</p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map((ticket) => (
                     <Card key={ticket._id} className="overflow-hidden flex flex-col">
                        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                           {ticket.imageUrl ? (
                              <img src={ticket.imageUrl} alt={ticket.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
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

               {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                     <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                     </Button>
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                           key={p}
                           variant={p === page ? 'default' : 'outline'}
                           size="sm"
                           className="min-w-9"
                           onClick={() => handlePageChange(p)}
                        >
                           {p}
                        </Button>
                     ))}
                     <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                     </Button>
                  </div>
               )}
            </>
         )}
      </div>
   );
}
