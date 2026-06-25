'use client';
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Ticket, Users, DollarSign, ShoppingCart, TrendingUp, Package, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = {
   emerald: '#10b981',
   blue: '#3b82f6',
   amber: '#f59e0b',
   purple: '#8b5cf6',
   red: '#ef4444',
   slate: '#64748b',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

// ---------------------------------------------------------------------------
// Hook: watches the `dark` class on <html> so chart colours update instantly
// when the user toggles the theme without needing a page reload.
// ---------------------------------------------------------------------------
function useDarkMode() {
   const [isDark, setIsDark] = useState(false);

   useEffect(() => {
      const html = document.documentElement;
      // Initial read
      setIsDark(html.classList.contains('dark'));

      const observer = new MutationObserver(() => {
         setIsDark(html.classList.contains('dark'));
      });
      observer.observe(html, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
   }, []);

   return isDark;
}

export default function VendorRevenue() {
   const { data: session } = authClient.useSession();
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const isDark = useDarkMode();

   // ------------------------------------------------------------------
   // Theme-aware colour tokens for Recharts elements.
   // These mirror the CSS custom-properties defined in globals.css so
   // the charts always match the current shadcn/ui theme.
   // ------------------------------------------------------------------
   const tickColor      = isDark ? '#a1a1aa' : '#71717a';   // zinc-400 / zinc-500
   const gridColor      = isDark ? '#27272a' : '#e4e4e7';   // zinc-800 / zinc-200
   const tooltipBg      = isDark ? '#09090b' : '#ffffff';   // zinc-950 / white
   const tooltipBorder  = isDark ? '#27272a' : '#e4e4e7';
   const tooltipText    = isDark ? '#fafafa'  : '#09090b';  // zinc-50  / zinc-950
   const axisLineColor  = isDark ? '#3f3f46' : '#d4d4d8';   // zinc-700 / zinc-300

   useEffect(() => {
      const fetchStats = async () => {
         if (!session?.user?.email) return;
         try {
            setLoading(true);
            const { data: { token: jwtToken } } = await authClient.token();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor-stats/${session.user.email}`, {
               headers: { Authorization: `Bearer ${jwtToken}` },
            });
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
         } catch (error) {
            console.error(error);
            toast.error('Failed to load revenue data');
         } finally {
            setLoading(false);
         }
      };
      fetchStats();
   }, [session]);

   if (loading) {
      return (
         <div className="space-y-6 p-2">
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[1, 2, 3, 4].map((i) => (
                  <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
               ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
               <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            </div>
         </div>
      );
   }

   if (!stats) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-sm font-medium">Could not load revenue data.</p>
         </div>
      );
   }

   const bookingStatusData = [
      { name: 'Accepted', value: stats.acceptedRequests || 0 },
      { name: 'Pending', value: stats.pendingRequests || 0 },
      { name: 'Rejected', value: stats.rejectedRequests || 0 },
   ].filter((d) => d.value > 0);

   const ticketsData = [
      { name: 'Added', tickets: stats.totalTicketsAdded || 0, fill: COLORS.blue },
      { name: 'Sold', tickets: stats.totalTicketsSold || 0, fill: COLORS.emerald },
   ];

   const dailyData = (stats.dailyRevenue || []).map((d) => ({
      date: d._id,
      revenue: d.revenue,
      tickets: d.ticketsSold,
   }));

   // Shared tooltip style – passed to every <Tooltip /> so all charts
   // look consistent and readable in both light and dark modes.
   const tooltipStyle = {
      contentStyle: {
         background:    tooltipBg,
         border:        `1px solid ${tooltipBorder}`,
         borderRadius:  '8px',
         fontSize:      '13px',
         color:         tooltipText,
      },
      labelStyle:  { color: tooltipText, fontWeight: 600 },
      itemStyle:   { color: tickColor },
   };

   // Custom label renderer for the Pie chart – gives us full control over
   // text colour so it isn't stuck on Recharts' default dark grey.
   const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 1.45;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
         <text
            x={x}
            y={y}
            fill={tickColor}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={500}
         >
            {`${name} ${(percent * 100).toFixed(0)}%`}
         </text>
      );
   };

   return (
      <div className="space-y-6 p-2">
         <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Revenue Overview</h2>
            <p className="text-muted-foreground text-sm">Track your ticket sales, earnings, and booking requests.</p>
         </div>

         {/* Stat Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
               <CardContent className="p-5 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tickets Added</p>
                     <p className="text-3xl font-black mt-1">{stats.totalTicketsAdded || 0}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-950/30 p-3 rounded-full">
                     <Package className="h-6 w-6 text-blue-600" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
               <CardContent className="p-5 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tickets Sold</p>
                     <p className="text-3xl font-black mt-1">{stats.totalTicketsSold || 0}</p>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-950/30 p-3 rounded-full">
                     <Ticket className="h-6 w-6 text-emerald-600" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm">
               <CardContent className="p-5 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Revenue</p>
                     <p className="text-3xl font-black mt-1">${Number(stats.totalRevenue || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-950/30 p-3 rounded-full">
                     <DollarSign className="h-6 w-6 text-amber-600" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
               <CardContent className="p-5 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Requests</p>
                     <p className="text-3xl font-black mt-1">{stats.pendingRequests || 0}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-950/30 p-3 rounded-full">
                     <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Charts Row */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tickets Added vs Sold */}
            <Card className="shadow-sm bg-gray-300">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                     <TrendingUp className="h-4 w-4 text-primary" />
                     Tickets Overview
                  </CardTitle>
                  <CardDescription>Comparison of tickets added vs sold</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ticketsData} barSize={60}>
                           <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                           <XAxis
                              dataKey="name"
                              stroke={axisLineColor}
                              tick={{ fontSize: 12, fill: tickColor }}
                           />
                           <YAxis
                              stroke={axisLineColor}
                              tick={{ fontSize: 12, fill: tickColor }}
                           />
                           <Tooltip
                              contentStyle={tooltipStyle.contentStyle}
                              labelStyle={tooltipStyle.labelStyle}
                              itemStyle={tooltipStyle.itemStyle}
                              cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                           />
                           <Bar dataKey="tickets" radius={[6, 6, 0, 0]}>
                              {ticketsData.map((entry, index) => (
                                 <Cell key={index} fill={entry.fill} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>

            {/* Booking Status Distribution */}
            <Card className="shadow-sm bg-gray-300">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                     <ShoppingCart className="h-4 w-4 text-primary" />
                     Booking Status
                  </CardTitle>
                  <CardDescription>Distribution of booking requests</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="h-72 flex items-center justify-center">
                     {bookingStatusData.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                           <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                           <p className="text-sm">No booking requests yet</p>
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={bookingStatusData}
                                 cx="50%"
                                 cy="45%"
                                 innerRadius={60}
                                 outerRadius={90}
                                 paddingAngle={4}
                                 dataKey="value"
                                 labelLine={false}
                                 label={renderPieLabel}
                              >
                                 {bookingStatusData.map((_, index) => (
                                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                 ))}
                              </Pie>
                              <Tooltip
                                 contentStyle={tooltipStyle.contentStyle}
                                 labelStyle={tooltipStyle.labelStyle}
                                 itemStyle={tooltipStyle.itemStyle}
                              />
                              <Legend
                                 formatter={(value) => (
                                    <span style={{ color: tickColor, fontSize: 12 }}>{value}</span>
                                 )}
                              />
                           </PieChart>
                        </ResponsiveContainer>
                     )}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Daily Revenue Chart (last 7 days) */}
         {dailyData.length > 0 && (
            <Card className="shadow-sm bg-gray-300">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                     <TrendingUp className="h-4 w-4 text-primary" />
                     Daily Revenue (Last 7 Days)
                  </CardTitle>
                  <CardDescription>Revenue and tickets sold per day</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyData}>
                           <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                           <XAxis
                              dataKey="date"
                              stroke={axisLineColor}
                              tick={{ fontSize: 11, fill: tickColor }}
                           />
                           <YAxis
                              stroke={axisLineColor}
                              tick={{ fontSize: 11, fill: tickColor }}
                           />
                           <Tooltip
                              contentStyle={tooltipStyle.contentStyle}
                              labelStyle={tooltipStyle.labelStyle}
                              itemStyle={tooltipStyle.itemStyle}
                           />
                           <Legend
                              formatter={(value) => (
                                 <span style={{ color: tickColor, fontSize: 12 }}>{value}</span>
                              )}
                           />
                           <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke={COLORS.emerald}
                              strokeWidth={2}
                              dot={{ fill: COLORS.emerald, r: 4 }}
                              activeDot={{ r: 6, fill: COLORS.emerald }}
                              name="Revenue ($)"
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Summary Cards Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-950/30">
               <CardContent className="p-5 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Conversion Rate</p>
                  <p className="text-2xl font-black mt-2">
                     {stats.totalTicketsAdded > 0
                        ? `${((stats.totalTicketsSold / stats.totalTicketsAdded) * 100).toFixed(1)}%`
                        : '0%'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">of added tickets were sold</p>
               </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-emerald-100 dark:border-emerald-950/30">
               <CardContent className="p-5 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Avg. Revenue / Ticket</p>
                  <p className="text-2xl font-black mt-2">
                     ${stats.totalTicketsSold > 0 ? (stats.totalRevenue / stats.totalTicketsSold).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per ticket sold</p>
               </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-100 dark:border-amber-950/30">
               <CardContent className="p-5 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Bookings</p>
                  <p className="text-2xl font-black mt-2">
                     {(stats.pendingRequests || 0) + (stats.acceptedRequests || 0) + (stats.rejectedRequests || 0) + (stats.totalTicketsSold > 0 ? 1 : 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">across all statuses</p>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
