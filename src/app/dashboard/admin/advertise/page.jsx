'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Megaphone, Loader2, AlertCircle, Calendar, MapPin, Bus, Train, Plane, Ship, Ticket } from 'lucide-react';

const getTransportIcon = (type) => {
   switch (type?.toLowerCase()) {
      case 'bus': return <Bus className="h-3.5 w-3.5 text-blue-500" />;
      case 'train': return <Train className="h-3.5 w-3.5 text-orange-500" />;
      case 'air': case 'plane': return <Plane className="h-3.5 w-3.5 text-purple-500" />;
      default: return <Ship className="h-3.5 w-3.5 text-teal-500" />;
   }
};

export default function AdvertiseTickets() {
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [processingId, setProcessingId] = useState(null);

   const fetchTickets = async () => {
      try {
         setLoading(true);
         const { data: { token: jwtToken } } = await authClient.token();

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/admin`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
         });

         if (!response.ok) throw new Error('Failed to fetch tickets.');
         const data = await response.json();
         setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error(error);
         toast.error('Failed to load tickets', { description: error.message });
         setTickets([]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTickets();
   }, []);

   const handleToggleAdvertise = async (ticket) => {
      const newState = !ticket.isAdvertised;
      setProcessingId(ticket._id);
      try {
         const { data: { token: jwtToken } } = await authClient.token();

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/advertise/${ticket._id}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ isAdvertised: newState }),
         });

         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to update advertise status.');
         }

         toast.success(newState ? 'Ticket Advertised' : 'Ticket Unadvertised', {
            description: `Ticket "${ticket.title}" has been ${newState ? 'added to' : 'removed from'} advertisements.`,
         });

         await fetchTickets();
      } catch (error) {
         console.error(error);
         toast.error('Action Failed', { description: error.message });
      } finally {
         setProcessingId(null);
      }
   };

   const approvedTickets = tickets.filter((t) => t.verificationStatus === 'approved' && !t.isHidden);
   const advertisedCount = tickets.filter((t) => t.isAdvertised).length;

   if (loading) {
      return (
         <Card className="w-full">
            <CardHeader>
               <Skeleton className="h-6 w-1/4 mb-2" />
               <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
               {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
               ))}
            </CardContent>
         </Card>
      );
   }

   return (
      <div className="space-y-6 p-2">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Advertise Tickets</h2>
            <p className="text-muted-foreground text-sm">Promote approved tickets on the homepage advertisement section.</p>
         </div>

         <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4">
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="text-lg flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Ticket Advertisement Manager
                     </CardTitle>
                     <CardDescription>
                        Toggle the advertise status for approved tickets. A maximum of 6 tickets can be advertised at once.
                     </CardDescription>
                  </div>
                  <Badge
                     variant="outline"
                     className={`text-xs px-3 py-1 font-semibold ${
                        advertisedCount >= 6
                           ? 'border-red-200 text-red-600 bg-red-50 dark:border-red-950/40 dark:text-red-400 dark:bg-red-950/20'
                           : 'border-primary/30 text-primary bg-primary/5'
                     }`}
                  >
                     {advertisedCount} / 6 Advertised
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {approvedTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                     <AlertCircle className="h-8 w-8 opacity-40 mb-3" />
                     <p className="text-sm font-medium">No approved tickets available to advertise.</p>
                     <p className="text-xs mt-1">Tickets must be approved by an admin before they can be advertised.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader className="bg-muted/30">
                           <TableRow>
                              <TableHead className="font-semibold text-xs text-foreground">Ticket</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground">Route</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-right">Price</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Advertised</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Action</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {approvedTickets.map((ticket) => {
                              const isProcessing = processingId === ticket._id;

                              return (
                                 <TableRow key={ticket._id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="py-3 max-w-[200px]">
                                       <div className="flex flex-col">
                                          <span className="font-bold text-foreground line-clamp-1 text-sm flex items-center gap-1.5">
                                             {getTransportIcon(ticket.transportType)}
                                             {ticket.title || 'Untitled Ticket'}
                                          </span>
                                          <span className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                                             {ticket.transportType || 'Standard'} Package
                                          </span>
                                       </div>
                                    </TableCell>

                                    <TableCell className="py-3">
                                       <div className="flex items-center gap-1.5 text-xs font-semibold">
                                          <span className="text-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{ticket.from || 'N/A'}</span>
                                          <span className="text-muted-foreground font-normal">→</span>
                                          <span className="text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">{ticket.to || 'N/A'}</span>
                                       </div>
                                    </TableCell>

                                    <TableCell className="py-3 text-right">
                                       <span className="font-bold text-sm">${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'}</span>
                                    </TableCell>

                                    <TableCell className="py-3 text-center">
                                       {ticket.isAdvertised ? (
                                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none text-xs">
                                             <Megaphone className="h-3 w-3 mr-1" />
                                             Featured
                                          </Badge>
                                       ) : (
                                          <span className="text-xs text-muted-foreground">—</span>
                                       )}
                                    </TableCell>

                                    <TableCell className="py-3 text-center">
                                       <Button
                                          size="sm"
                                          variant={ticket.isAdvertised ? 'outline' : 'default'}
                                          disabled={isProcessing || (!ticket.isAdvertised && advertisedCount >= 6)}
                                          onClick={() => handleToggleAdvertise(ticket)}
                                          className="h-7 text-[11px] font-bold px-3"
                                       >
                                          {isProcessing ? (
                                             <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                          ) : ticket.isAdvertised ? (
                                             'Unadvertise'
                                          ) : (
                                             <>
                                                <Megaphone className="h-3 w-3 mr-1" />
                                                Advertise
                                             </>
                                          )}
                                       </Button>
                                    </TableCell>
                                 </TableRow>
                              );
                           })}
                        </TableBody>
                     </Table>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
