'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { DollarSign, AlertCircle, Ticket, Calendar, CreditCard } from 'lucide-react';

export default function TransactionHistory() {
   const { data: session } = authClient.useSession();
   const [payments, setPayments] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPayments = async () => {
         if (!session?.user?.email) return;
         try {
            setLoading(true);
            const { data: { token: jwtToken } } = await authClient.token();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${session.user.email}`, {
               headers: { Authorization: `Bearer ${jwtToken}` },
            });
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            setPayments(Array.isArray(data) ? data : []);
         } catch (error) {
            console.error(error);
            toast.error('Failed to load transaction history');
            setPayments([]);
         } finally {
            setLoading(false);
         }
      };
      fetchPayments();
   }, [session]);

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
            <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
            <p className="text-muted-foreground text-sm">View all your completed payments.</p>
         </div>

         <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Records
               </CardTitle>
               <CardDescription>
                  A log of all successful transactions made through your account.
               </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                     <AlertCircle className="h-8 w-8 opacity-40 mb-3" />
                     <p className="text-sm font-medium">No transactions yet.</p>
                     <p className="text-xs mt-1">Your payment history will appear here after you make a purchase.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader className="bg-muted/30">
                           <TableRow>
                              <TableHead className="font-semibold text-xs text-foreground">Transaction ID</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground">Ticket</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-right">Amount</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-right">Date</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {payments.map((payment) => (
                              <TableRow key={payment._id} className="hover:bg-muted/20 transition-colors">
                                 <TableCell className="py-3">
                                    <span className="font-mono text-xs text-muted-foreground">{payment.transactionId}</span>
                                 </TableCell>
                                 <TableCell className="py-3">
                                    <div className="flex items-center gap-2">
                                       <Ticket className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                       <span className="font-medium text-sm">{payment.ticketTitle || 'Ticket'}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-3 text-right">
                                    <span className="font-bold text-sm">${Number(payment.amount).toFixed(2)}</span>
                                 </TableCell>
                                 <TableCell className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                                       <Calendar className="h-3.5 w-3.5" />
                                       <span>{new Date(payment.paymentDate).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
