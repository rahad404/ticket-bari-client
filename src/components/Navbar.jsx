"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, PlaneTakeoff, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/modetoggle";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
   Avatar,
   AvatarFallback,
   AvatarImage,
} from "@/components/ui/avatar";

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
   const [isOpen, setIsOpen] = React.useState(false);
   const router = useRouter();

   // Public links: Home and All Tickets
   const publicLinks = [
      { label: "Home", href: "/" },
      { label: "All Tickets", href: "/tickets" },
   ];

   // Private link: Dashboard (only visible when logged in)
   const privateLink = { label: "Dashboard", href: "/dashboard" };

   const { data: session } = authClient.useSession();
   const user = session?.user;

   const handleLogout = async () => {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/");
   };

   return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container mx-auto flex h-16 items-center justify-between px-4">

            {/* Logo (Kept Intact) */}
            <Link href="/">
               <div className='flex items-center justify-center gap-2 xl:justify-start'>
                  <div className='bg-primary flex size-9 items-center justify-center rounded-xl shadow-md shadow-primary/20'>
                     <PlaneTakeoff color="#ffffff" />
                  </div>
                  <span className='text-xl font-bold tracking-tight'>
                     Ticket<span className="text-primary">Bari</span>
                  </span>
               </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
               {publicLinks.map((link) => (
                  <Link
                     key={link.label}
                     href={link.href}
                     className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                     {link.label}
                  </Link>
               ))}

               {user && (
                  <Link
                     href={privateLink.href}
                     className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                     {privateLink.label}
                  </Link>
               )}
            </div>

            {/* Desktop Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
               <ModeToggle />

               {user ? (
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-3 focus:outline-none hover:opacity-90 transition">
                           <span className="text-sm font-medium text-foreground">
                              {user?.name}
                           </span>
                           <Avatar className="h-9 w-9 rounded-full">
                              <AvatarImage
                                 referrerPolicy="no-referrer"
                                 src={user?.image}
                                 alt={user?.name}
                              />
                              <AvatarFallback>
                                 {user?.name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                           </Avatar>
                        </button>
                     </DropdownMenuTrigger>

                     <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>My Profile</span>
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                           className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
                           onClick={handleLogout}
                        >
                           <LogOut className="h-4 w-4" />
                           <span>Logout</span>
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               ) : (
                  <>
                     <Link href="/login">
                        <Button variant="ghost">Login</Button>
                     </Link>
                     <Link href="/signup">
                        <Button>Signup</Button>
                     </Link>
                  </>
               )}
            </div>

            {/* Mobile View Toggle / Burger Menu */}
            <div className="flex md:hidden items-center gap-2">
               <ModeToggle />

               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle Menu"
               >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
               </Button>
            </div>
         </div>

         {/* Mobile Menu Dropdown */}
         {isOpen && (
            <div className="md:hidden border-b bg-background px-4 py-4 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">

               {/* Mobile Nav Links */}
               <div className="flex flex-col space-y-3">
                  {publicLinks.map((link) => (
                     <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                     >
                        {link.label}
                     </Link>
                  ))}

                  {user && (
                     <Link
                        href={privateLink.href}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                     >
                        {privateLink.label}
                     </Link>
                  )}
               </div>

               <hr className="border-border" />

               {/* Mobile Dynamic Auth Area */}
               <div className="flex flex-col space-y-3">
                  {user ? (
                     <>
                        <div className="flex items-center gap-3 border rounded-md p-3 bg-muted/40">
                           <Avatar className="h-10 w-10 rounded-full">
                              <AvatarImage
                                 referrerPolicy="no-referrer"
                                 src={user?.image}
                                 alt={user?.name}
                              />
                              <AvatarFallback>
                                 {user?.name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                           </Avatar>

                           <div className="flex flex-col">
                              <span className="font-medium text-sm">{user?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                 {user?.email}
                              </span>
                           </div>
                        </div>

                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                           <Button variant="outline" className="w-full justify-start gap-2">
                              <User className="h-4 w-4" />
                              My Profile
                           </Button>
                        </Link>

                        <Button
                           variant="destructive"
                           className="w-full justify-start gap-2"
                           onClick={async () => {
                              await handleLogout();
                              setIsOpen(false);
                           }}
                        >
                           <LogOut className="h-4 w-4" />
                           Logout
                        </Button>
                     </>
                  ) : (
                     <div className="grid grid-cols-2 gap-2">
                        <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                           <Button variant="ghost" className="w-full">
                              Login
                           </Button>
                        </Link>

                        <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full">
                           <Button className="w-full">
                              Signup
                           </Button>
                        </Link>
                     </div>
                  )}
               </div>
            </div>
         )}
      </nav>
   );
}