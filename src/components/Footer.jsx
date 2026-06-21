import Link from "next/link";
import {
   BusFront,
   TrainFront,
   Ship,
   Plane,
   Mail,
   Phone,
   CircleFadingPlus,
   CreditCard,
   PlaneTakeoff,
} from "lucide-react";

const Footer = () => {
   const currentYear = new Date().getFullYear();

   return (
      <footer className="w-full bg-zinc-50 border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Grid: 4 columns on desktop, 1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

               {/* Column 1: Logo + Description */}
               <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                     <div className="flex items-center -space-x-1 text-primary bg-primary/10 p-2 rounded-xl gap-2 dark:bg-primary/20">
                        <BusFront className="w-4 h-4" />
                        <TrainFront className="w-4 h-4" />
                        <Ship className="w-4 h-4" />
                        <Plane className="w-4 h-4" />
                     </div>
                     <div className="flex items-center -space-x-1 gap-3 ">
                        {/* <div className="flex items-center -space-x-1 text-primary bg-primary/10 p-2 rounded-xl gap-2 dark:bg-primary/20">
                           <PlaneTakeoff color="#ffffff" className="w-4 h-4" />
                        </div> */}
                        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                           Ticket<span className="text-primary">Bari</span>
                        </span>
                     </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
                     Book bus, train, launch &amp; flight tickets seamlessly. Your journey begins here.
                  </p>
               </div>

               {/* Column 2: Quick Links */}
               <div className="flex flex-col space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                     Quick Links
                  </h3>
                  <ul className="space-y-2.5 text-sm">
                     <li>
                        <Link
                           href="/"
                           className="text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
                        >
                           Home
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/all-tickets"
                           className="text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
                        >
                           All Tickets
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/contact"
                           className="text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
                        >
                           Contact Us
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/about"
                           className="text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
                        >
                           About Us
                        </Link>
                     </li>
                  </ul>
               </div>

               {/* Column 3: Contact Info */}
               <div className="flex flex-col space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                     Contact Info
                  </h3>
                  <ul className="space-y-3 text-sm">
                     <li className="flex items-center space-x-3 text-muted-foreground">
                        <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                        <span className="truncate">support@ticketbari.com</span>
                     </li>
                     <li className="flex items-center space-x-3 text-muted-foreground">
                        <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                        <span>+880 1234 567890</span>
                     </li>
                     <li className="flex items-center space-x-3 text-muted-foreground">
                        <div className="relative flex items-center justify-center">
                           <CircleFadingPlus className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute scale-125 opacity-20 animate-pulse" />
                           {/* Inline clean SVG fallback for Facebook brand icon */}
                           <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 fill-current" viewBox="0 0 24 24">
                              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                           </svg>
                        </div>
                        <a
                           href="https://facebook.com/ticketbari"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
                        >
                           TicketBari Page
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Column 4: Payment Methods */}
               <div className="flex flex-col space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                     Payment Methods
                  </h3>
                  <div className="flex flex-col space-y-3">
                     <div className="flex items-center space-x-2 text-muted-foreground">
                        <CreditCard className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-sm font-medium">Stripe Secure</span>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] font-medium bg-zinc-200/60 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                           Visa
                        </span>
                        <span className="text-[11px] font-medium bg-zinc-200/60 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                           Mastercard
                        </span>
                        <span className="text-[11px] font-medium bg-zinc-200/60 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                           Amex
                        </span>
                     </div>
                     <p className="text-xs text-muted-foreground/70">
                        All transactions are encrypted and processed securely.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Bottom Bar */}
         <div className="border-t border-zinc-200 dark:border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-xs text-muted-foreground text-center sm:text-left">
                  &copy; {currentYear} TicketBari. All rights reserved.
               </p>
               <div className="flex space-x-4 text-xs text-muted-foreground">
                  <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                  <Link href="/terms" className="hover:underline">Terms of Service</Link>
               </div>
            </div>
         </div>
      </footer>
   );
};

export default Footer;