'use client';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, ShieldCheck, ShieldAlert, Loader2, AlertCircle, UserPlus, Ban } from 'lucide-react';

export default function ManageUsersClient() {
   const { data: session } = authClient.useSession();
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [processingId, setProcessingId] = useState(null);

   const fetchUsers = async () => {
      try {
         setLoading(true);
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
         });
         if (!response.ok) throw new Error('Failed to fetch users');
         const data = await response.json();
         setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
         console.error(error);
         toast.error('Failed to load users');
         setUsers([]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchUsers(); }, []);

   const handleRoleChange = async (userId, newRole) => {
      setProcessingId(userId);
      try {
         const { data: { token: jwtToken } } = await authClient.token();
         const endpoint = newRole === 'admin' ? 'admin' : 'vendor';
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${endpoint}/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
         });
         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to update role');
         }
         toast.success(`User promoted to ${newRole}`);
         await fetchUsers();
      } catch (error) {
         console.error(error);
         toast.error('Action Failed', { description: error.message });
      } finally {
         setProcessingId(null);
      }
   };

   const handleToggleFraud = async (userId) => {
      setProcessingId(userId);
      try {
         const { data: { token: jwtToken } } = await authClient.token();
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/fraud/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
         });
         if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to toggle fraud status');
         }
         toast.success('Fraud status updated');
         await fetchUsers();
      } catch (error) {
         console.error(error);
         toast.error('Action Failed', { description: error.message });
      } finally {
         setProcessingId(null);
      }
   };

   const getRoleBadge = (role) => {
      switch (role) {
         case 'admin': return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none text-xs">Admin</Badge>;
         case 'vendor': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none text-xs">Vendor</Badge>;
         default: return <Badge variant="secondary" className="text-xs">User</Badge>;
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
            <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
            <p className="text-muted-foreground text-sm">View all registered users and manage their roles and permissions.</p>
         </div>

         <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Management
               </CardTitle>
               <CardDescription>
                  Promote users to admin or vendor roles, or mark vendors as fraud to block their listings.
               </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                     <AlertCircle className="h-8 w-8 opacity-40 mb-3" />
                     <p className="text-sm font-medium">No users found.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader className="bg-muted/30">
                           <TableRow>
                              <TableHead className="font-semibold text-xs text-foreground">User</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground">Email</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Role</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Status</TableHead>
                              <TableHead className="font-semibold text-xs text-foreground text-center">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {users.map((user) => {
                              const isSelf = session?.user?.email === user.email;
                              const isProcessing = processingId === user._id;
                              const isAdmin = user.role === 'admin';
                              const isVendor = user.role === 'vendor';
                              const isFraud = user.isFraud === true;

                              return (
                                 <TableRow key={user._id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="py-3">
                                       <div className="flex items-center gap-3">
                                          <Avatar className="h-8 w-8 border">
                                             <AvatarImage src={user.image || undefined} alt={user.name} />
                                             <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                             </AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium text-sm">{user.name || 'Unknown'}</span>
                                       </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                       <span className="text-sm text-muted-foreground">{user.email}</span>
                                    </TableCell>
                                    <TableCell className="py-3 text-center">{getRoleBadge(user.role)}</TableCell>
                                    <TableCell className="py-3 text-center">
                                       {isFraud && (
                                          <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                                             <Ban className="h-3 w-3 mr-1" />Fraud
                                          </Badge>
                                       )}
                                    </TableCell>
                               <TableCell className="py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                     <Button size="sm" variant="outline"
                                        disabled={isProcessing || isAdmin || isSelf}
                                        onClick={() => handleRoleChange(user._id, 'admin')}
                                        className="h-7 text-[11px] font-bold px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 disabled:opacity-40"
                                     >
                                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-1" />}
                                        Make Admin
                                     </Button>
                                     <Button size="sm" variant="outline"
                                        disabled={isProcessing || isVendor || isSelf}
                                        onClick={() => handleRoleChange(user._id, 'vendor')}
                                        className="h-7 text-[11px] font-bold px-2.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/20 disabled:opacity-40"
                                     >
                                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
                                        Make Vendor
                                     </Button>
                                     {isVendor && (
                                        <Button size="sm" variant={isFraud ? 'default' : 'outline'}
                                           disabled={isProcessing}
                                           onClick={() => handleToggleFraud(user._id)}
                                           className={`h-7 text-[11px] font-bold px-2.5 ${isFraud ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20'} disabled:opacity-40`}
                                        >
                                           {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                                           {isFraud ? 'Remove Fraud' : 'Mark as Fraud'}
                                        </Button>
                                     )}
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
