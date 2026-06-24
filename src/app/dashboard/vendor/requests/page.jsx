'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Ticket, Mail, User, Calendar, DollarSign, Package } from 'lucide-react';

export default function VendorRequests() {
   const { data: session } = authClient.useSession();

   const [bookings, setBookings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [processingId, setProcessingId] = useState(null);

   const fetchBookings = async () => {
      if (!session?.user?.email) return;
      try {
         setLoading(true);
         const { data: { token: jwtToken } } = await authClient.token();

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/vendor/${session.user.email}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
         });

         if (!response.ok) throw new Error('Failed to fetch booking requests.');
         const data = await response.json();
         setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error(error);
         toast.error('Failed to load booking requests', { description: error.message });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBookings();
   }, [session]);

   const handleAction = async (bookingId, action) => {
      setProcessingId(bookingId);
      try {
         const { data: { token: jwtToken } } = await authClient.token();

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${action}/${bookingId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${jwtToken}`,
            },
         });

         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Failed to ${action} booking.`);
         }

         toast.success(`Booking ${action === 'accept' ? 'Accepted' : 'Rejected'}`, {
            description: `The booking request has been ${action === 'accept' ? 'accepted' : 'rejected'} successfully.`,
         });

         await fetchBookings();
      } catch (error) {
         console.error(error);
         toast.error('Action Failed', { description: error.message });
      } finally {
         setProcessingId(null);
      }
   };

   const getStatusBadge = (status) => {
      switch (status) {
         case 'accepted':
            return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none capitalize text-xs">Accepted</Badge>;
         case 'rejected':
            return <Badge variant="destructive" className="capitalize text-xs">Rejected</Badge>;
         case 'paid':
            return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none capitalize text-xs">Paid</Badge>;
         default:
            return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 capitalize text-xs">Pending</Badge>;
      }
   };

   if (loading) {
      return (
         <Card className="w-full">
            <CardHeader>
               <Skeleton className="h-6 w-1/4 mb-2" />
               <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
               {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
               ))}
            </CardContent>
         </Card>
      );
   }

   return (
      <div className="space-y-6 p-2">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Requested Bookings</h2>
            <p className="text-muted-foreground text-sm">Review, accept, or reject booking requests from customers.</p>
         </div>

         <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Booking Requests Queue
               </CardTitle>
               <CardDescription>
                  Customers have requested to book your tickets. Accept to confirm or reject to decline.
               </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                     <AlertCircle className="h-8 w-8 opacity-40 mb-3" />
                     <p className="text-sm font-medium">No booking requests yet.</p>
                     <p className="text-xs mt-1">When customers book your tickets, their requests will appear here.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader className="bg-muted/30">
                           <TableRow>
                              <TableHead className="font-semibold text-xs text-foreground">Customer</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground">Ticket</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-right">Qty</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-right">Total Price</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Status</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {bookings.map((booking) => {
                              const bookingId = booking._id;
                              const isActioning = processingId === bookingId;
                              const isPending = booking.status === 'pending';

                              return (
                                 <TableRow key={bookingId} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="py-3 max-w-[200px]">
                                       <div className="flex flex-col">
                                          <span className="font-medium text-foreground text-sm flex items-center gap-1.5">
                                             <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                             {booking.userName || 'Unknown'}
                                          </span>
                                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                             <Mail className="h-3 w-3 shrink-0" />
                                             {booking.userEmail}
                                          </span>
                                       </div>
                                    </TableCell>

                                    <TableCell className="py-3">
                                       <div className="flex flex-col">
                                          <span className="font-semibold text-sm text-foreground line-clamp-1">{booking.ticketTitle || 'Untitled'}</span>
                                          {booking.from && booking.to && (
                                             <span className="text-[11px] text-muted-foreground mt-0.5">
                                                {booking.from} → {booking.to}
                                             </span>
                                          )}
                                       </div>
                                    </TableCell>

                                    <TableCell className="py-3 text-right">
                                       <div className="flex items-center justify-end gap-1 text-sm font-medium">
                                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                          {booking.bookingQuantity}
                                       </div>
                                    </TableCell>

                                    <TableCell className="py-3 text-right">
                                       <span className="font-bold text-sm">${Number(booking.totalPrice || booking.unitPrice * booking.bookingQuantity).toFixed(2)}</span>
                                    </TableCell>

                                    <TableCell className="py-3 text-center">
                                       {getStatusBadge(booking.status)}
                                    </TableCell>

                                    <TableCell className="py-3 text-center">
                                       {isPending ? (
                                          <div className="flex items-center justify-center gap-2">
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isActioning}
                                                onClick={() => handleAction(bookingId, 'accept')}
                                                className="h-7 text-[11px] font-bold px-2.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                                             >
                                                {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                Accept
                                             </Button>
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isActioning}
                                                onClick={() => handleAction(bookingId, 'reject')}
                                                className="h-7 text-[11px] font-bold px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20"
                                             >
                                                {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                                                Reject
                                             </Button>
                                          </div>
                                       ) : (
                                          <span className="text-xs text-muted-foreground">—</span>
                                       )}
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
