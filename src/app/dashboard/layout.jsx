"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // Adjust this path to match your Better Auth client instance
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Loader2 } from "lucide-react";
import Aside from "@/components/Aside";

export default function DashboardLayout({ children }) {
   const router = useRouter();
   const [isMobileOpen, setIsMobileOpen] = useState(false);

   // Better Auth client session hook
   const { data: session, isPending, error } = authClient.useSession();

   // Handle loading state smoothly with a Lucide spinner
   if (isPending) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      );
   }

   // Secure route – guard content and redirect unauthenticated users
   if (!session || error) {
      router.push("/login");
      return null;
   }

   return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
         {/* Desktop Sidebar */}
         <aside className="hidden md:flex md:w-64 flex-col border-r bg-card">
            <Aside />
         </aside>

         {/* Main Container */}
         <div className="flex flex-col flex-1 overflow-hidden">

            {/* Global Dashboard Header */}
            <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 bg-card">
               <div className="flex items-center gap-4">

                  {/* Mobile Drawer (Sheet) */}
                  <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                     <SheetTrigger asChild>
                        <Button
                           variant="ghost"
                           size="icon"
                           className="md:hidden"
                           aria-label="Open Menu"
                        >
                           <Menu className="w-5 h-5" />
                        </Button>
                     </SheetTrigger>
                     <SheetContent side="left" className="p-0 w-64">
                        {/* Optional: Pass down close handler if your navigation links inside Aside need to shut the mobile drawer */}
                        <Aside closeMobileMenu={() => setIsMobileOpen(false)} />
                     </SheetContent>
                  </Sheet>

                  <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
               </div>

               {/* User Profile Action / Status */}
               <div className="flex items-center gap-4">
                  <Avatar className="w-8 h-8 border">
                     <AvatarImage
                        src={session.user.image || undefined}
                        alt={session.user.name || "User avatar"}
                     />
                     <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                     </AvatarFallback>
                  </Avatar>
               </div>
            </header>

            {/* Scrollable Viewport Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 focus:outline-none">
               {children}
            </main>
         </div>
      </div>
   );
}