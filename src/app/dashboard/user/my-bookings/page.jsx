'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, AlertCircle, Ticket, Users, DollarSign, Ban, Loader2, ShoppingCart, CheckCircle2, XCircle } from 'lucide-react';

function Countdown({ targetDate }) {
   const [timeLeft, setTimeLeft] = useState(null);

   useEffect(() => {
      if (!targetDate) return;
      const update = () => {
         const diff = new Date(targetDate) - new Date();
         if (diff <= 0) { setTimeLeft({ expired: true }); return; }
         setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            expired: false,
         });
      };
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
   }, [targetDate]);

   if (!timeLeft) return null;
   if (timeLeft.expired) return <span className="text-xs text-red-500 font-medium">Departed</span>;

   return (
      <div className="flex items-center gap-1 font-mono text-xs tabular-nums">
         <Clock className="h-3 w-3 text-muted-foreground" />
         {timeLeft.days > 0 && <span className="bg-muted px-1.5 py-0.5 rounded font-bold">{timeLeft.days}d</span>}
         <span className="bg-muted px-1.5 py-0.5 rounded font-bold">{String(timeLeft.hours).padStart(2, '0')}h</span>
         <span className="bg-muted px-1.5 py-0.5 rounded font-bold">{String(timeLeft.minutes).padStart(2, '0')}m</span>
         <span className="bg-muted px-1.5 py-0.5 rounded font-bold">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
   );
}

export default function MyBookedTickets() {
   const { data: session } = authClient.useSession();
   const [bookings, setBookings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [payingId, setPayingId] = useState(null);

   const fetchBookings = async () => {
      if (!session?.user?.email) return;
      try {
         setLoading(true);
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/user/${session.user.email}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
         });
         if (!response.ok) throw new Error('Failed to fetch bookings');
         const data = await response.json();
         setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error(error);
         toast.error('Failed to load bookings');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBookings();
   }, [session]);

   const handlePayNow = async (booking) => {
      setPayingId(booking._id);
      try {
         const { data: { token: jwtToken } } = await authClient.token();

         const checkoutRes = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               bookingId: booking._id,
               amount: booking.totalPrice,
               email: session?.user?.email,
            }),
         });

         if (!checkoutRes.ok) {
            const errData = await checkoutRes.json();
            throw new Error(errData.error || 'Failed to create checkout session');
         }

         const { url } = await checkoutRes.json();
         window.location.href = url;
      } catch (error) {
         console.error(error);
         toast.error('Payment failed', { description: error.message });
      } finally {
         setPayingId(null);
      }
   };

   const getStatusBadge = (status) => {
      switch (status) {
         case 'accepted': return <Badge className="bg-emerald-500 text-white border-none text-xs">Accepted</Badge>;
         case 'rejected': return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
         case 'paid': return <Badge className="bg-blue-500 text-white border-none text-xs">Paid</Badge>;
         default: return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-xs">Pending</Badge>;
      }
   };

   const isExpired = (date) => date && new Date(date) <= new Date();

   if (loading) {
      return (
         <div className="space-y-6 p-2">
            <div className="flex flex-col gap-1">
               <Skeleton className="h-6 w-1/4 mb-2" />
               <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                     <Skeleton className="aspect-[16/9] w-full rounded-none" />
                     <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
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
      );
   }

   return (
      <div className="space-y-6 p-2">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">My Booked Tickets</h2>
            <p className="text-muted-foreground text-sm">View all your booked tickets and manage payments.</p>
         </div>

         {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
               <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
               <h3 className="text-lg font-semibold">No bookings yet</h3>
               <p className="text-sm text-muted-foreground max-w-sm mt-1">Browse available tickets and book your next journey.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {bookings.map((booking) => {
                  const expired = isExpired(booking.departureDateTime);
                  const canPay = booking.status === 'accepted' && !expired;
                  const isPaying = payingId === booking._id;

                  return (
                     <Card key={booking._id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow border border-muted group">
                        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                           {booking.ticketImage ? (
                              <img src={booking.ticketImage} alt={booking.ticketTitle} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                           ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                 <Ticket className="h-10 w-10 opacity-30" />
                              </div>
                           )}
                           <div className="absolute top-2 right-2">
                              {getStatusBadge(booking.status)}
                           </div>
                        </div>
                        <CardContent className="flex-1 p-4 space-y-3">
                           <h3 className="font-bold text-sm leading-tight line-clamp-1">{booking.ticketTitle || 'Untitled'}</h3>

                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="font-medium text-foreground">{booking.from || 'N/A'}</span>
                              <span>→</span>
                              <span className="font-medium text-primary">{booking.to || 'N/A'}</span>
                           </div>

                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>{booking.departureDateTime ? new Date(booking.departureDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Flexible'}</span>
                           </div>

                           <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                 <Users className="h-3.5 w-3.5" />
                                 <span>Qty: <strong>{booking.bookingQuantity}</strong></span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-primary">
                                 <DollarSign className="h-3.5 w-3.5" />
                                 <span>${Number(booking.totalPrice || booking.unitPrice * booking.bookingQuantity).toFixed(2)}</span>
                              </div>
                           </div>

                           {booking.status !== 'rejected' && booking.departureDateTime && (
                              <div className="pt-1">
                                 <Countdown targetDate={booking.departureDateTime} />
                              </div>
                           )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                           {booking.status === 'pending' && (
                              <p className="text-xs text-muted-foreground w-full text-center py-1">Awaiting vendor confirmation</p>
                           )}
                           {booking.status === 'accepted' && (
                              <Button
                                 className="w-full text-xs"
                                 size="sm"
                                 disabled={!canPay || isPaying}
                                 onClick={() => handlePayNow(booking)}
                              >
                                 {isPaying ? (
                                    <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Processing...</>
                                 ) : expired ? (
                                    <><Ban className="h-3.5 w-3.5 mr-1.5" />Departure Passed</>
                                 ) : (
                                    <><ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Pay Now</>
                                 )}
                              </Button>
                           )}
                           {booking.status === 'paid' && (
                              <Badge className="w-full justify-center bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-none text-xs py-1.5">
                                 <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Payment Complete
                              </Badge>
                           )}
                           {booking.status === 'rejected' && (
                              <Badge variant="destructive" className="w-full justify-center text-xs py-1.5">
                                 <XCircle className="h-3.5 w-3.5 mr-1" />Vendor Declined
                              </Badge>
                           )}
                        </CardFooter>
                     </Card>
                  );
               })}
            </div>
         )}
      </div>
   );
}
