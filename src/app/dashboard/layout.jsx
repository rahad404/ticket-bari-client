"use client";

import { useState, useEffect } from "react";
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
   const { data: session, isPending, error, refetch } = authClient.useSession();

   // Re-validate session from the server every time the browser tab becomes visible.
   // This ensures that admin-side changes (e.g. marking a vendor as fraud, changing roles)
   // are reflected on the vendor/user side without requiring a manual reload or re-login.
   useEffect(() => {
      const handleVisibilityChange = () => {
         if (document.visibilityState === "visible") {
            // Force a fresh session fetch from the server (bypasses any client-side cache)
            authClient.getSession({ fetchOptions: { cache: "no-store" } });
         }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
         document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
   }, []);

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
            {/* Scrollable Viewport Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 focus:outline-none">
               {children}
            </main>
         </div>
      </div>
   );
}