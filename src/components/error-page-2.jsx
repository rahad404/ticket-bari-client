'use client';
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LifeBuoy } from 'lucide-react'
import { PlaneTakeoff } from "lucide-react";
import { useRouter } from "next/navigation";

const ErrorPage2 = () => {
   const router = useRouter();

   const redirectHandler = () => {
      router.push('/');
   };

   return (
      <div className='grid min-h-screen w-full bg-background xl:grid-cols-2'>
         {/* Left Content Side */}
         <div className='flex flex-col p-6 sm:p-12 xl:p-16'>
            {/* Logo */}
            <div className='flex items-center justify-center gap-2 xl:justify-start'>
               <div className='bg-primary flex size-9 items-center justify-center rounded-xl shadow-md shadow-primary/20'>
                  <PlaneTakeoff color="#ffffff" />
               </div>
               <span className='text-lg font-semibold tracking-tight'>TicketBari</span>
            </div>

            {/* Main Content Area */}
            <div className='mt-12 flex flex-1 flex-col justify-center items-center text-center xl:items-start xl:text-left max-w-md mx-auto xl:mx-0'>
               {/* 404 Badge */}
               <div className='mb-5 inline-flex items-center rounded-full border border-muted px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/30 tracking-wider uppercase'>
                  Error 404
               </div>

               <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground'>
                  Page not found
               </h1>

               <p className='mt-4 text-base text-muted-foreground leading-relaxed'>
                  Sorry, we couldn’t find the page you’re looking for. Perhaps the URL is misspelled, or the page has been permanently relocated.
               </p>

               {/* Action Buttons */}
               <div className='mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto'>
                  <Button onClick={redirectHandler} className="w-full sm:w-auto h-10 px-5 gap-2 font-medium shadow-sm transition-all hover:opacity-90">
                     <ArrowLeft className="size-4" />
                     <span>Go back home</span>
                  </Button>
               </div>
            </div>

            {/* Footer info */}
            <div className='mt-auto pt-8 text-center xl:text-left'>
               <p className='text-xs text-muted-foreground/60'>
                  &copy; {new Date().getFullYear()} TicketBari. All rights reserved.
               </p>
            </div>
         </div>

         {/* Right Tech Canvas Side */}
         <div className='relative hidden xl:block'>
            <img
               src='../assets/error.jpeg'
               alt='placeholder image'
               className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.95] ' />
         </div>
      </div>
   );
}

export default ErrorPage2;
