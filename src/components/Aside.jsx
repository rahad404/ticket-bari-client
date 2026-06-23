"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // Adjust this path to match your Better Auth client instance
import {
   User,
   Ticket,
   PlusCircle,
   List,
   ShoppingCart,
   DollarSign,
   Users,
   LayoutDashboard,
   LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Menu items per role
const menuItems = {
   user: [
      { name: "Profile", href: "/dashboard/user/profile", icon: User },
      { name: "My Bookings", href: "/dashboard/user/bookings", icon: Ticket },
      { name: "Transactions", href: "/dashboard/user/transactions", icon: DollarSign },
   ],
   vendor: [
      { name: "Profile", href: "/dashboard/vendor/profile", icon: User },
      { name: "Add Ticket", href: "/dashboard/vendor/add-ticket", icon: PlusCircle },
      { name: "My Tickets", href: "/dashboard/vendor/my-tickets", icon: List },
      { name: "Requests", href: "/dashboard/vendor/requests", icon: ShoppingCart },
      { name: "Revenue", href: "/dashboard/vendor/revenue", icon: DollarSign },
   ],
   admin: [
      { name: "Profile", href: "/dashboard/admin/profile", icon: User },
      { name: "Manage Tickets", href: "/dashboard/admin/manage-tickets", icon: Ticket },
      { name: "Manage Users", href: "/dashboard/admin/manage-users", icon: Users },
      { name: "Advertise", href: "/dashboard/admin/advertise", icon: LayoutDashboard },
   ],
};

export default function Aside({ closeMobileMenu }) {
   const router = useRouter();
   const pathname = usePathname();
   
   // Grab the reactive session data from Better Auth
   const { data: session } = authClient.useSession();

   const userRole = session?.user?.role || "user";
   const items = menuItems[userRole] || menuItems.user;

   const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

   // Better Auth logout handler
   const handleSignOut = async () => {
      await authClient.signOut({
         fetchOptions: {
            onSuccess: () => {
               router.push("/"); // Redirect home or to login page after signing out
            },
         },
      });
   };

   return (
      <div className="flex flex-col h-full bg-card">
         {/* Navigation */}
         <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
               {items.map((item) => {
                  const Icon = item.icon;
                  return (
                     <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMobileMenu} // Closes the mobile sheet on click
                        className={cn(
                           "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                           isActive(item.href)
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                     >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                     </Link>
                  );
               })}
            </nav>
         </ScrollArea>

         {/* User & Logout */}
         <div className="border-t p-4 space-y-3 bg-card">
            <div className="flex items-center gap-3">
               <Avatar className="w-9 h-9 border">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User profile"} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                     {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
               </Avatar>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                     {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                     {userRole}
                  </p>
               </div>
            </div>
            <Button
               variant="outline"
               className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
               onClick={handleSignOut}
            >
               <LogOut className="w-4 h-4 mr-2" />
               Logout
            </Button>
         </div>
      </div>
   );
}