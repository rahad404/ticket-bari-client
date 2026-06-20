"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, BookUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/modetoggle";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
   Avatar,
   AvatarBadge,
   AvatarFallback,
   AvatarImage,
} from "@/components/ui/avatar";

export function Navbar() {
   const [isOpen, setIsOpen] = React.useState(false);
   const router = useRouter();

   const navLinks = [
      { label: "Home", href: "/" },
      { label: "Tutors", href: "/tutors" },
   ];

   const privateNavLink = [
      { label: "Add Tutor", href: "/add-tutor" },
      { label: "My Tutor", href: "/my-tutor" },
      { label: "My Booked Sessions", href: "/my-booked-sessions" },
   ];

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

            {/* Logo */}
            <Link href="/">
               <div className="flex items-center space-x-2 cursor-pointer">
                  <BookUser className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold tracking-tight text-foreground">
                     MediQueue
                  </span>
               </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
               {navLinks.map((link) => (
                  <Link
                     key={link.label}
                     href={link.href}
                     className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                     {link.label}
                  </Link>
               ))}

               {user &&
                  privateNavLink.map((link) => (
                     <Link
                        key={link.label}
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                     >
                        {link.label}
                     </Link>
                  ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
               <ModeToggle />

               {user ? (
                  <>
                     <Link
                        href="/profile"
                        className="flex items-center space-x-3 font-medium"
                     >
                        <Avatar>
                           <AvatarImage
                              referrerPolicy="no-referrer"
                              src={user?.image}
                              alt={user?.name}
                           />
                           <AvatarFallback>
                              {user?.name?.[0]}
                           </AvatarFallback>
                           <AvatarBadge className="bg-[#33ff00] dark:bg-[#2cdd00]" />
                        </Avatar>
                        <Button variant="ghost">Profile</Button>
                     </Link>

                     <Button onClick={handleLogout}>Log out</Button>
                  </>
               ) : (
                  <>
                     <Link href="/login">
                        <Button variant="ghost">Log in</Button>
                     </Link>
                     <Link href="/signup">
                        <Button>Sign up</Button>
                     </Link>
                  </>
               )}
            </div>

            {/* Mobile Right Section (NEW FIX) */}
            <div className="flex md:hidden items-center gap-2">

               {/* Avatar on mobile */}
               {user && (
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                     <Avatar className="h-8 w-8">
                        <AvatarImage
                           referrerPolicy="no-referrer"
                           src={user?.image}
                           alt={user?.name}
                        />
                        <AvatarFallback>
                           {user?.name?.[0]}
                        </AvatarFallback>
                     </Avatar>
                  </Link>
               )}

               {/* Burger Menu */}
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle Menu"
               >
                  {isOpen ? (
                     <X className="h-6 w-6" />
                  ) : (
                     <Menu className="h-6 w-6" />
                  )}
               </Button>
            </div>
         </div>

         {/* Mobile Menu */}
         {isOpen && (
            <div className="md:hidden border-b bg-background px-4 py-4 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">

               {/* Nav Links */}
               <div className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                     <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                     >
                        {link.label}
                     </Link>
                  ))}

                  {user &&
                     privateNavLink.map((link) => (
                        <Link
                           key={link.label}
                           href={link.href}
                           onClick={() => setIsOpen(false)}
                           className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                        >
                           {link.label}
                        </Link>
                     ))}
               </div>

               <hr className="border-border" />

               {/* Auth */}
               <div className="flex flex-col space-y-3">
                  <div className="flex justify-center">
                     <ModeToggle />
                  </div>

                  {user ? (
                     <>
                        <Link
                           href="/profile"
                           onClick={() => setIsOpen(false)}
                           className="flex items-center gap-3 border rounded-md p-3"
                        >
                           <Avatar>
                              <AvatarImage
                                 referrerPolicy="no-referrer"
                                 src={user?.image}
                                 alt={user?.name}
                              />
                              <AvatarFallback>
                                 {user?.name?.[0]}
                              </AvatarFallback>
                           </Avatar>

                           <div className="flex flex-col">
                              <span className="font-medium">{user?.name}</span>
                              <span className="text-sm text-muted-foreground">
                                 View Profile
                              </span>
                           </div>
                        </Link>

                        <Button
                           className="w-full"
                           onClick={async () => {
                              await handleLogout();
                              setIsOpen(false);
                           }}
                        >
                           Log out
                        </Button>
                     </>
                  ) : (
                     <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                           <Button variant="ghost" className="w-full">
                              Log in
                           </Button>
                        </Link>

                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                           <Button className="w-full">
                              Sign up
                           </Button>
                        </Link>
                     </>
                  )}
               </div>
            </div>
         )}
      </nav>
   );
}
