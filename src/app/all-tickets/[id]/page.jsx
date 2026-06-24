'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Bus, Train, Plane, Ship, Calendar, MapPin, Clock, AlertCircle, DollarSign, Users, ShoppingCart, Loader2, ArrowLeft, Ticket, CheckCircle2, Ban, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const PERK_LABELS = {
   ac: 'Air Conditioned',
   breakfast: 'Complimentary Breakfast',
   wifi: 'Free Wi-Fi',
   blanket: 'Blanket & Pillow',
   charging: 'Charging Outlets',
};

const getTransportIcon = (type) => {
   switch (type?.toLowerCase()) {
      case 'bus': return <Bus className="h-5 w-5 text-blue-500" />;
      case 'train': return <Train className="h-5 w-5 text-orange-500" />;
      case 'air':
      case 'plane': return <Plane className="h-5 w-5 text-purple-500" />;
      default: return <Ship className="h-5 w-5 text-teal-500" />;
   }
};

function Countdown({ targetDate }) {
   const [timeLeft, setTimeLeft] = useState(null);

   useEffect(() => {
      if (!targetDate) return;

      const update = () => {
         const diff = new Date(targetDate) - new Date();
         if (diff <= 0) {
            setTimeLeft({ expired: true });
            return;
         }
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

   if (timeLeft.expired) {
      return (
         <div className="flex items-center gap-2 text-red-500 font-medium">
            <Ban className="h-4 w-4" />
            <span>Departure has passed</span>
         </div>
      );
   }

   return (
      <div className="flex items-center gap-2">
         <Clock className="h-4 w-4 text-muted-foreground" />
         <div className="flex items-center gap-1.5 font-mono text-sm tabular-nums">
            {timeLeft.days > 0 && (
               <span className="bg-muted px-2 py-0.5 rounded font-bold">{timeLeft.days}<span className="text-muted-foreground font-normal ml-0.5">d</span></span>
            )}
            <span className="bg-muted px-2 py-0.5 rounded font-bold">{String(timeLeft.hours).padStart(2, '0')}<span className="text-muted-foreground font-normal ml-0.5">h</span></span>
            <span className="bg-muted px-2 py-0.5 rounded font-bold">{String(timeLeft.minutes).padStart(2, '0')}<span className="text-muted-foreground font-normal ml-0.5">m</span></span>
            <span className="bg-muted px-2 py-0.5 rounded font-bold">{String(timeLeft.seconds).padStart(2, '0')}<span className="text-muted-foreground font-normal ml-0.5">s</span></span>
         </div>
      </div>
   );
}

export default function TicketDetailsPage() {
   const { id } = useParams();
   const router = useRouter();
   const { data: session, isPending: sessionPending } = authClient.useSession();

   const [ticket, setTicket] = useState(null);
   const [ticketLoading, setTicketLoading] = useState(true);
   const [ticketError, setTicketError] = useState(null);

   const [bookingOpen, setBookingOpen] = useState(false);
   const [bookingQuantity, setBookingQuantity] = useState(1);
   const [isBooking, setIsBooking] = useState(false);

   const fetchTicket = useCallback(async () => {
      if (!session) return;
      try {
         setTicketLoading(true);
         setTicketError(null);
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
         });
         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to fetch ticket');
         }
         const data = await response.json();
         setTicket(data);
      } catch (error) {
         console.error(error);
         setTicketError(error.message);
         toast.error('Failed to load ticket', { description: error.message });
      } finally {
         setTicketLoading(false);
      }
   }, [id, session]);

   useEffect(() => {
      if (session) fetchTicket();
   }, [session, fetchTicket]);

   if (sessionPending) {
      return (
         <div className="min-h-svh flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      );
   }

   if (!session) {
      router.push('/login');
      return null;
   }

   if (ticketLoading) {
      return (
         <div className="min-h-svh py-8 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="aspect-[21/9] w-full rounded-xl" />
            <div className="space-y-4">
               <Skeleton className="h-8 w-2/3" />
               <Skeleton className="h-5 w-1/3" />
               <Skeleton className="h-5 w-1/2" />
               <Skeleton className="h-20 w-full" />
            </div>
         </div>
      );
   }

   if (ticketError || !ticket) {
      return (
         <div className="min-h-svh flex flex-col items-center justify-center py-20 text-center px-4">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Ticket not found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">{ticketError || 'The ticket you are looking for does not exist or has been removed.'}</p>
            <Link href="/all-tickets">
               <Button variant="outline" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Tickets
               </Button>
            </Link>
         </div>
      );
   }

   const isExpired = ticket.departureDateTime && new Date(ticket.departureDateTime) <= new Date();
   const isSoldOut = (ticket.quantity ?? 0) <= 0;
   const isUnavailable = ticket.verificationStatus !== 'approved' || ticket.isHidden;
   const canBook = !isExpired && !isSoldOut && !isUnavailable;

   const handleBooking = async () => {
      if (bookingQuantity < 1 || bookingQuantity > ticket.quantity) {
         toast.error('Invalid quantity', { description: `Please enter a quantity between 1 and ${ticket.quantity}.` });
         return;
      }
      setIsBooking(true);
      try {
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
               ticketId: ticket._id,
               bookingQuantity,
               userEmail: session.user.email,
               userName: session.user.name,
            }),
         });
         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Booking failed');
         }
         toast.success('Booking request submitted successfully!', {
            description: 'Your booking is pending vendor confirmation.',
         });
         setBookingOpen(false);
         setBookingQuantity(1);
      } catch (error) {
         console.error(error);
         toast.error('Booking failed', { description: error.message });
      } finally {
         setIsBooking(false);
      }
   };

   return (
      <div className="min-h-svh py-8 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
         <Link href="/all-tickets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to All Tickets
         </Link>

         <div className="aspect-[21/9] relative overflow-hidden rounded-xl bg-muted">
            {ticket.imageUrl ? (
               <img src={ticket.imageUrl} alt={ticket.title} className="object-cover w-full h-full" />
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Ticket className="h-16 w-16 opacity-30" />
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
               <Card>
                  <CardContent className="p-6 space-y-5">
                     <div className="flex items-start justify-between gap-3">
                        <div>
                           <h1 className="text-2xl font-bold">{ticket.title || 'Untitled Ticket'}</h1>
                           <div className="flex items-center gap-2 mt-1.5">
                              {getTransportIcon(ticket.transportType)}
                              <span className="text-sm text-muted-foreground capitalize">{ticket.transportType || 'Standard'} Package</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{ticket.from || 'N/A'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">{ticket.to || 'N/A'}</span>
                     </div>

                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{ticket.departureDateTime ? new Date(ticket.departureDateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }) : 'Flexible'}</span>
                     </div>

                     {ticket.perks?.length > 0 && (
                        <div className="space-y-2">
                           <h4 className="text-sm font-semibold">Amenities & Perks</h4>
                           <div className="flex flex-wrap gap-2">
                              {ticket.perks.map((perk) => (
                                 <Badge key={perk} variant="secondary" className="text-xs px-2.5 py-1">
                                    {PERK_LABELS[perk] || perk}
                                 </Badge>
                              ))}
                           </div>
                        </div>
                     )}

                     {ticket.description && (
                        <div className="space-y-1">
                           <h4 className="text-sm font-semibold">Description</h4>
                           <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        </div>
                     )}

                     {ticket.vendorName && (
                        <div className="text-xs text-muted-foreground border-t pt-3">
                           Listed by <span className="font-medium text-foreground">{ticket.vendorName}</span>
                           {ticket.vendorEmail && <span> ({ticket.vendorEmail})</span>}
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-4">
               <Card className="sticky top-24">
                  <CardContent className="p-5 space-y-4">
                     <div className="text-center pb-3 border-b">
                        <div className="text-3xl font-bold text-primary">${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'}</div>
                        <div className="text-xs text-muted-foreground">per seat</div>
                     </div>

                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Available Seats</span>
                        <span className={`font-semibold ${isSoldOut ? 'text-red-500' : ''}`}>
                           {isSoldOut ? 'Sold Out' : ticket.quantity}
                        </span>
                     </div>

                     {ticket.departureDateTime && (
                        <div className="border-t pt-3">
                           <Countdown targetDate={ticket.departureDateTime} />
                        </div>
                     )}

                     {isUnavailable && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-2 rounded-md">
                           <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                           <span>This ticket is not available for booking.</span>
                        </div>
                     )}

                     <Button
                        className="w-full"
                        size="lg"
                        disabled={!canBook}
                        onClick={() => setBookingOpen(true)}
                     >
                        {isSoldOut ? 'Sold Out' : isExpired ? 'Departed' : isUnavailable ? 'Unavailable' : (
                           <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Book Now
                           </>
                        )}
                     </Button>
                  </CardContent>
               </Card>
            </div>
         </div>

         <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Book Ticket</DialogTitle>
                  <DialogDescription>
                     {ticket.title} — {ticket.from} → {ticket.to}
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Unit Price</span>
                     <span className="font-semibold">${Number(ticket.price).toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="quantity">Number of Seats</Label>
                     <Input
                        id="quantity"
                        type="number"
                        min={1}
                        max={ticket.quantity}
                        value={bookingQuantity}
                        onChange={(e) => {
                           const val = parseInt(e.target.value, 10);
                           setBookingQuantity(isNaN(val) ? 1 : Math.max(1, Math.min(val, ticket.quantity)));
                        }}
                     />
                     <p className="text-xs text-muted-foreground">Maximum {ticket.quantity} seats available.</p>
                  </div>

                  <div className="flex items-center justify-between text-sm border-t pt-3 font-semibold">
                     <span>Total</span>
                     <span className="text-lg text-primary">${(Number(ticket.price) * bookingQuantity).toFixed(2)}</span>
                  </div>
               </div>

               <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline" disabled={isBooking}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleBooking} disabled={isBooking || bookingQuantity < 1 || bookingQuantity > ticket.quantity}>
                     {isBooking ? (
                        <>
                           <Loader2 className="h-4 w-4 animate-spin mr-2" />
                           Booking...
                        </>
                     ) : (
                        'Confirm Booking'
                     )}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
