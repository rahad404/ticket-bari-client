'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function UserDashboard() {
   const router = useRouter();
   const { data: session, isPending } = authClient.useSession();

   useEffect(() => {
      if (!isPending && session) {
         router.replace('/dashboard/user/profile');
      }
   }, [session, isPending, router]);

   if (isPending) {
      return (
         <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
         </div>
      );
   }

   return null;
}
