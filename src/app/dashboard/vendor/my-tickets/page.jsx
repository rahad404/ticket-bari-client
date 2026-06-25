'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Calendar, MapPin, Ticket, Trash2, Edit3, Loader2, AlertCircle, Bus, Train, Plane, Ship } from 'lucide-react';

const PERK_OPTIONS = [
   { id: 'ac', label: 'Air Conditioned (AC)' },
   { id: 'breakfast', label: 'Complimentary Breakfast' },
   { id: 'wifi', label: 'Free Wi-Fi' },
   { id: 'blanket', label: 'Blanket & Pillow' },
   { id: 'charging', label: 'Charging Outlets' },
];

export default function MyAddedTickets({ user }) {
   const { data: session } = authClient.useSession();
   const currentUser = user || session?.user;

   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [updatingTicketId, setUpdatingTicketId] = useState(null);
   const [isMutating, setIsMutating] = useState(false);

   const { register, handleSubmit, setValue, watch, reset } = useForm();
   const selectedPerks = watch('perks') || [];

   // Re-fetch session on mount and on tab focus so that admin-applied changes
   // (e.g. fraud flag, role change) immediately appear for the vendor.
   useEffect(() => {
      authClient.getSession({ fetchOptions: { cache: 'no-store' } });

      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            authClient.getSession({ fetchOptions: { cache: 'no-store' } });
         }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
   }, []);

   // Fetch Vendor's specific tickets
   const fetchTickets = async () => {
      if (!currentUser?.email) return;
      try {
         setLoading(true);
         const { data: { token: jwtToken } } = await authClient.token();

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/vendor/${currentUser.email}`, {
            headers: {
               'Authorization': `Bearer ${jwtToken}`,
            },
         });
         if (!response.ok) throw new Error('Failed to retrieve your tickets.');
         const data = await response.json();
         setTickets(data);
      } catch (error) {
         console.error(error);
         toast.error('Error', { description: error.message });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTickets();
   }, [currentUser?.email]);


   // Handle Edit Prep (Populate React Hook Form defaults)
   const openEditModal = (ticket) => {
      setUpdatingTicketId(ticket._id);
      reset({
         title: ticket.title,
         from: ticket.from,
         to: ticket.to,
         transportType: ticket.transportType,
         price: ticket.price,
         quantity: ticket.quantity,
         departureDateTime: ticket.departureDateTime,
         perks: ticket.perks || [],
      });
   };

   // Update Ticket Action
   const onUpdateSubmit = async (data) => {
      setIsMutating(true);
      try {
         const { data: { token: jwtToken } } = await authClient.token();

         const payload = {
            ...data,
            price: parseFloat(data.price),
            quantity: parseInt(data.quantity, 10),
         };

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${updatingTicketId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Could not update ticket mapping parameters.');
         }

         toast.success('Success', { description: 'Ticket detailed data updated successfully.' });
         setUpdatingTicketId(null);
         fetchTickets();
      } catch (error) {
         toast.error('Update Failed', { description: error.message });
      } finally {
         setIsMutating(false);
      }
   };

   // Delete Ticket Action
   const handleDelete = async (ticketId) => {
      if (!confirm('Are you absolutely sure you want to drop this travel package listing?')) return;

      try {
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${jwtToken}`,
            },
         });

         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Could not process deletion route.');
         }

         toast.success('Deleted', { description: 'Ticket removed from platform rosters.' });
         fetchTickets();
      } catch (error) {
         toast.error('Deletion Blocked', { description: error.message });
      }
   };

   const getStatusBadge = (status) => {
      switch (status) {
         case 'approved':
            return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Approved</Badge>;
         case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
         default:
            return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200">Pending Review</Badge>;
      }
   };

   const getTransportIcon = (type) => {
      switch (type) {
         case 'bus': return <Bus className="h-4 w-4 opacity-70" />;
         case 'train': return <Train className="h-4 w-4 opacity-70" />;
         case 'air': return <Plane className="h-4 w-4 opacity-70" />;
         default: return <Ship className="h-4 w-4 opacity-70" />;
      }
   };

   const handlePerkCheckboxChange = (perkId, checked) => {
      if (checked) {
         setValue('perks', [...selectedPerks, perkId]);
      } else {
         setValue('perks', selectedPerks.filter((id) => id !== perkId));
      }
   };

   if (loading) {
      return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
            {[1, 2, 3].map((i) => (
               <Card key={i} className="w-full space-y-4 p-4">
                  <Skeleton className="h-40 w-full rounded-md" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
               </Card>
            ))}
         </div>
      );
   }

   if (tickets.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No tickets added yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
               Any transit inventories you submit will populate inside this control grid.
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-6 p-2">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">My Added Tickets</h2>
            <p className="text-muted-foreground text-sm">Manage, track approval states, or modify active listings configurations.</p>
         </div>

         {/* 3-Column Grid Layout */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
               const isRejected = ticket.verificationStatus === 'rejected';

               return (
                  <Card key={ticket._id} className="flex flex-col h-full overflow-hidden border shadow-sm group">
                     {/* Image Preview Window */}
                     <div className="relative w-full h-44 bg-muted overflow-hidden">
                        <img
                           src={ticket.imageUrl || '/placeholder-transit.jpg'}
                           alt={ticket.title}
                           className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                           {getStatusBadge(ticket.verificationStatus)}
                        </div>
                     </div>

                     {/* Card Contents */}
                     <CardHeader className="p-4 pb-2 space-y-1">
                        <CardTitle className="text-lg line-clamp-1 font-bold">{ticket.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 capitalize text-xs font-semibold text-primary">
                           {getTransportIcon(ticket.transportType)}
                           {ticket.transportType} Transit
                        </CardDescription>
                     </CardHeader>

                     <CardContent className="p-4 pt-0 pb-3 flex-grow space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between text-xs border-y py-2 my-1 bg-muted/30 px-2 rounded">
                           <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-destructive" /> <b>{ticket.from}</b></span>
                           <span className="text-muted-foreground">→</span>
                           <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-500" /> <b>{ticket.to}</b></span>
                        </div>

                        <div className="space-y-1.5">
                           <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Departure:</span>
                              <span className="font-medium text-foreground">{new Date(ticket.departureDateTime).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1"><Ticket className="h-3.5 w-3.5" /> Capacity Remaining:</span>
                              <span className="font-bold text-foreground">{ticket.quantity} units</span>
                           </div>
                        </div>

                        {/* Amenities Rendering Block */}
                        {ticket.perks?.length > 0 && (
                           <div className="flex flex-wrap gap-1 pt-1">
                              {ticket.perks.map((p) => (
                                 <Badge key={p} variant="outline" className="text-[10px] capitalize px-1.5 py-0">
                                    {p}
                                 </Badge>
                              ))}
                           </div>
                        )}
                     </CardContent>

                     <CardFooter className="p-4 pt-0 border-t flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10 mt-auto">
                        <div className="mt-3">
                           <p className="text-xs text-muted-foreground">Price per unit</p>
                           <p className="text-lg font-black text-foreground">${ticket.price.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                           {/* Edit Dialog Trigger */}
                           <Dialog open={updatingTicketId === ticket._id} onOpenChange={(open) => !open && setUpdatingTicketId(null)}>
                              <DialogTrigger asChild>
                                 <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isRejected}
                                    onClick={() => openEditModal(ticket)}
                                    className="h-8 gap-1 px-2.5 text-xs"
                                 >
                                    <Edit3 className="h-3.5 w-3.5" /> Update
                                 </Button>
                              </DialogTrigger>

                              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                 <DialogHeader>
                                    <DialogTitle>Modify Package Parameters</DialogTitle>
                                    <DialogDescription>Adjust route information. Status defaults back for administrative verification cycles.</DialogDescription>
                                 </DialogHeader>

                                 <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4 py-2">
                                    <div className="space-y-1.5">
                                       <Label>Transit Title Context</Label>
                                       <Input {...register('title', { required: true })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                       <div className="space-y-1.5">
                                          <Label>From</Label>
                                          <Input {...register('from', { required: true })} />
                                       </div>
                                       <div className="space-y-1.5">
                                          <Label>To</Label>
                                          <Input {...register('to', { required: true })} />
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                       <div className="space-y-1.5">
                                          <Label>Fleet Selection</Label>
                                          <Select
                                             defaultValue={ticket.transportType}
                                             onValueChange={(val) => setValue('transportType', val)}
                                          >
                                             <SelectTrigger><SelectValue /></SelectTrigger>
                                             <SelectContent>
                                                <SelectItem value="bus">Bus</SelectItem>
                                                <SelectItem value="train">Train</SelectItem>
                                                <SelectItem value="air">Air</SelectItem>
                                                <SelectItem value="launch">Launch</SelectItem>
                                             </SelectContent>
                                          </Select>
                                       </div>
                                       <div className="space-y-1.5">
                                          <Label>Price ($)</Label>
                                          <Input type="number" step="0.01" {...register('price', { required: true })} />
                                       </div>
                                       <div className="space-y-1.5">
                                          <Label>Capacity Allotment</Label>
                                          <Input type="number" {...register('quantity', { required: true })} />
                                       </div>
                                    </div>

                                    <div className="space-y-1.5">
                                       <Label>Departure Time Matrix</Label>
                                       <Input type="datetime-local" {...register('departureDateTime', { required: true })} />
                                    </div>

                                    <div className="space-y-2">
                                       <Label className="text-xs font-semibold">Amenities Additions</Label>
                                       <div className="grid grid-cols-2 gap-2 border rounded p-3 bg-muted/20">
                                          {PERK_OPTIONS.map((perk) => (
                                             <div key={perk.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                   id={`edit-${perk.id}`}
                                                   checked={selectedPerks.includes(perk.id)}
                                                   onCheckedChange={(checked) => handlePerkCheckboxChange(perk.id, checked)}
                                                />
                                                <label htmlFor={`edit-${perk.id}`} className="text-xs font-medium cursor-pointer">{perk.label}</label>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    <DialogFooter className="pt-2">
                                       <Button type="button" variant="ghost" onClick={() => setUpdatingTicketId(null)}>Cancel</Button>
                                       <Button type="submit" disabled={isMutating}>
                                          {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                          Save Parameters
                                       </Button>
                                    </DialogFooter>
                                 </form>
                              </DialogContent>
                           </Dialog>

                           {/* Delete Button */}
                           <Button
                              size="sm"
                              variant="destructive"
                              disabled={isRejected}
                              onClick={() => handleDelete(ticket._id)}
                              className="h-8 gap-1 px-2.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 dark:border-none"
                           >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                           </Button>
                        </div>
                     </CardFooter>
                  </Card>
               );
            })}
         </div>
      </div>
   );
}