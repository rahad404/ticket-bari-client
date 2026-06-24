'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Calendar, Loader2, Bus, Train, Plane, Ship, Ticket } from 'lucide-react';

export default function ManageTickets() {
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [processingId, setProcessingId] = useState(null);

   // Fetch all pending and submitted tickets globally across vendors
   const fetchGlobalTickets = async () => {
      try {
         setLoading(true);
         const { data: { token: jwtToken } } = await authClient.token();

         if (!jwtToken) {
            throw new Error('Authentication session token is missing. Please sign in again.');
         }

         const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/tickets/admin`;
         console.log("Fetching admin tickets from:", apiUrl); // Debug log to verify URL shape

         const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${jwtToken}`,
               'Content-Type': 'application/json'
            },
         });

         if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Server returned ${response.status}: ${errorDetails || 'Could not fetch central data.'}`);
         }
         
         const data = await response.json();
         // Safety check to ensure data is an iterable array
         setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error("Frontend fetch global tickets error:", error);
         toast.error('Data Pull Interrupted', { description: error.message });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchGlobalTickets();
   }, []);

   // Moderate Verification Status Handshake Route
   const updateVerificationStatus = async (ticketId, nextStatus) => {
      setProcessingId(ticketId);
      try {
         const { data: { token: jwtToken } } = await authClient.token();

         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/verify/${ticketId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ verificationStatus: nextStatus }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Status mapping update failed.');
         }

         toast.success(`Ticket ${nextStatus}`, {
            description: `Listing status parameters committed as "${nextStatus}" successfully.`
         });

         // Refresh tabular records state matching backend properties
         await fetchGlobalTickets();
      } catch (error) {
         console.error(error);
         toast.error('Action Failed', { description: error.message });
      } finally {
         setProcessingId(null);
      }
   };

   const getStatusBadge = (status) => {
      switch (status) {
         case 'approved':
            return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none capitalize text-xs">Approved</Badge>;
         case 'rejected':
            return <Badge variant="destructive" className="capitalize text-xs">Rejected</Badge>;
         default:
            return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 capitalize text-xs">Pending</Badge>;
      }
   };

   const getTransportIcon = (type) => {
      switch (type?.toLowerCase()) {
         case 'bus': return <Bus className="h-3.5 w-3.5 text-blue-500" />;
         case 'train': return <Train className="h-3.5 w-3.5 text-orange-500" />;
         case 'air': case 'plane': return <Plane className="h-3.5 w-3.5 text-purple-500" />;
         default: return <Ship className="h-3.5 w-3.5 text-teal-500" />;
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
            <h2 className="text-2xl font-bold tracking-tight">Administrative Verifications</h2>
            <p className="text-muted-foreground text-sm">Review, approve, or reject inventory listings submitted by registered platform vendors.</p>
         </div>

         <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Global Ticket Approvals Queue
               </CardTitle>
               <CardDescription>
                  Approved packages scale directly into customer inventory lists; rejected values flag modification alerts back to vendors.
               </CardDescription>
            </CardHeader>
            <CardContent className="p-0">

               {tickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                     <AlertCircle className="h-8 w-8 opacity-40 mb-3" />
                     <p className="text-sm font-medium">No vendor listings require processing right now.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader className="bg-muted/30">
                           <TableRow>
                              <TableHead className="font-semibold text-xs text-foreground">Package Context</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground">Route (From → To)</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground">Departure Matrix</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-right">Pricing / Stock</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Status</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Moderation Handlers</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {tickets.map((ticket) => {
                              const ticketId = ticket._id || ticket.id; // Support fallback id fields smoothly
                              const isActioning = processingId === ticketId;

                              return (
                                 <TableRow key={ticketId} className="hover:bg-muted/20 transition-colors">

                                    {/* Title & Fleet Info Column */}
                                    <TableCell className="py-3 max-w-[200px]">
                                       <div className="flex flex-col">
                                          <span className="font-bold text-foreground line-clamp-1 text-sm">{ticket.title || 'Untitled Ticket'}</span>
                                          <span className="text-[11px] text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                                             {getTransportIcon(ticket.transportType)}
                                             {ticket.transportType || 'Standard'} Package
                                          </span>
                                       </div>
                                    </TableCell>

                                    {/* Travel Corridor Map Column */}
                                    <TableCell className="py-3">
                                       <div className="flex items-center gap-1.5 text-xs font-semibold">
                                          <span className="text-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{ticket.from || 'N/A'}</span>
                                          <span className="text-muted-foreground font-normal">→</span>
                                          <span className="text-primary bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">{ticket.to || 'N/A'}</span>
                                       </div>
                                    </TableCell>

                                    {/* Temporal Deployment Node Column */}
                                    <TableCell className="py-3">
                                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                          <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                          <span className="truncate max-w-[140px] font-medium">
                                             {ticket.departureDateTime ? new Date(ticket.departureDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}
                                          </span>
                                       </div>
                                    </TableCell>

                                    {/* Finance and Capacity Allocation Column */}
                                    <TableCell className="py-3 text-right">
                                       <div className="flex flex-col items-end">
                                          <span className="font-black text-foreground text-sm">${ticket.price ? Number(ticket.price).toFixed(2) : '0.00'}</span>
                                          <span className="text-[11px] text-muted-foreground font-medium">{ticket.quantity ?? 0} Allocations</span>
                                       </div>
                                    </TableCell>

                                    {/* Live Verification Status Badge Column */}
                                    <TableCell className="py-3 text-center">
                                       {getStatusBadge(ticket.verificationStatus)}
                                    </TableCell>

                                    {/* Dynamic Core Mod Buttons Section */}
                                    <TableCell className="py-3 text-center">
                                       <div className="flex items-center justify-center gap-2">
                                          {/* Approve Button */}
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             disabled={isActioning || ticket.verificationStatus === 'approved'}
                                             onClick={() => updateVerificationStatus(ticketId, 'approved')}
                                             className="h-7 text-[11px] font-bold px-2.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20 disabled:opacity-40"
                                          >
                                             {isActioning && processingId === ticketId ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />} 
                                             Approve
                                          </Button>

                                          {/* Reject Button */}
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             disabled={isActioning || ticket.verificationStatus === 'rejected'}
                                             onClick={() => updateVerificationStatus(ticketId, 'rejected')}
                                             className="h-7 text-[11px] font-bold px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 disabled:opacity-40"
                                          >
                                             {isActioning && processingId === ticketId ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />} 
                                             Reject
                                          </Button>
                                       </div>
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