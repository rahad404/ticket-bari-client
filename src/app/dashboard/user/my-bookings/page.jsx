'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Calendar, MapPin, Clock, AlertCircle, Ticket, Users, DollarSign, Ban, Loader2, ShoppingCart, CheckCircle2, XCircle, Trash2, Download } from 'lucide-react';

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

function downloadTicketPdf(booking) {
   const { jsPDF } = require('jspdf');
   const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
   const pageW = doc.internal.pageSize.getWidth();

   doc.setFillColor(15, 118, 110);
   doc.rect(0, 0, pageW, 35, 'F');

   doc.setTextColor(255, 255, 255);
   doc.setFontSize(18);
   doc.setFont('helvetica', 'bold');
   doc.text('TICKET BARI', pageW / 2, 16, { align: 'center' });

   doc.setFontSize(10);
   doc.setFont('helvetica', 'normal');
   doc.text('e-Ticket Confirmation', pageW / 2, 26, { align: 'center' });

   doc.setTextColor(0, 0, 0);
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text(booking.ticketTitle || 'Transport Ticket', pageW / 2, 50, { align: 'center' });

   const leftX = 15;
   let y = 62;

   doc.setFontSize(10);
   doc.setFont('helvetica', 'normal');
   const items = [
   { label: 'From', value: booking.from || 'N/A' },
   { label: 'To', value: booking.to || 'N/A' },
   { label: 'Departure', value: booking.departureDateTime ? new Date(booking.departureDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Flexible' },
   { label: 'Passenger', value: booking.userName || booking.userEmail || 'N/A' },
   { label: 'Quantity', value: String(booking.bookingQuantity) },
   { label: 'Unit Price', value: `$${Number(booking.unitPrice || 0).toFixed(2)}` },
   { label: 'Total Paid', value: `$${Number(booking.totalPrice || 0).toFixed(2)}` },
   { label: 'Status', value: booking.status || 'N/A' },
   { label: 'Booking ID', value: booking._id || 'N/A' },
   ];

   items.forEach((item) => {
   doc.setFont('helvetica', 'bold');
   doc.text(item.label + ':', leftX, y);
   doc.setFont('helvetica', 'normal');
   doc.text(String(item.value), leftX + 35, y);
   y += 8;
   });

   y += 8;
   doc.setFontSize(8);
   doc.setTextColor(100, 100, 100);
   doc.setFont('helvetica', 'italic');
   doc.text('Thank you for choosing Ticket Bari. Have a safe journey!', pageW / 2, y, { align: 'center' });

   doc.setFontSize(7);
   doc.text('Ticket Bari - Online Ticket Booking Platform', pageW / 2, y + 6, { align: 'center' });

   const filename = `ticket-${booking._id?.slice(-6) || 'download'}.pdf`;
   doc.save(filename);
}

export default function MyBookedTickets() {
   const { data: session } = authClient.useSession();
   const [bookings, setBookings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [payingId, setPayingId] = useState(null);
   const [cancellingId, setCancellingId] = useState(null);

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

   const handleCancel = async (bookingId) => {
      setCancellingId(bookingId);
      try {
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${jwtToken}` },
         });
         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to cancel booking');
         }
         toast.success('Booking cancelled successfully');
         await fetchBookings();
      } catch (error) {
         console.error(error);
         toast.error('Failed to cancel', { description: error.message });
      } finally {
         setCancellingId(null);
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
                  const isCancelling = cancellingId === booking._id;
                  const canCancel = booking.status === 'pending';

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
                                 <span>${Number(booking.totalPrice || booking.unitPrice * booking.bookingQuantity).toFixed(2)}</span>
                              </div>
                           </div>

                           {booking.status !== 'rejected' && booking.departureDateTime && (
                              <div className="pt-1">
                                 <Countdown targetDate={booking.departureDateTime} />
                              </div>
                           )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                           {booking.status === 'pending' && (
                              <>
                                 <p className="text-xs text-muted-foreground w-full text-center py-1">Awaiting vendor confirmation</p>
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20"
                                    disabled={isCancelling}
                                    onClick={() => handleCancel(booking._id)}
                                 >
                                    {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                                    Cancel Booking
                                 </Button>
                              </>
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
                              <>
                                 <Badge className="w-full justify-center bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-none text-xs py-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Payment Complete
                                 </Badge>
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={() => downloadTicketPdf(booking)}
                                 >
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Download Ticket PDF
                                 </Button>
                              </>
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
