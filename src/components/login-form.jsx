'use client'

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client"
import { useRouter } from 'next/navigation';
import { toast } from "sonner"
import { FaGoogle } from "react-icons/fa";
import { PlaneTakeoff } from "lucide-react";

export function LoginForm({ className, ...props }) {
   const router = useRouter();

   const onSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const userData = Object.fromEntries(formData.entries());

      // This will now log your actual values!
      console.log(userData);

      const { data, error } = await authClient.signIn.email({
         email: userData.email,
         password: userData.password,
      });

      if (data) {
         toast.success("Logged in successfully!");
         router.push("/");
      }
      if (error) {
         toast.error(error.message);
      }
   };

   const handleGoogleLogin = async () => {
      const { data, error } = await authClient.signIn.social({
         provider: "google",
      });
      if (data) {
         toast.success("Logged in successfully!");
         router.push("/");
      }
      if (error) {
         toast.error(error.message);
      }
   };

   return (
      <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
         <Card className="overflow-hidden border-t-4 border-t-primary shadow-lg">
            <CardHeader className="space-y-4 pt-2 text-center ">
               {/* TicketBari App Branding */}
               <div className='flex items-center justify-center gap-2'>
                  <div className='bg-primary flex size-9 items-center justify-center rounded-xl shadow-md shadow-primary/20'>
                     <PlaneTakeoff color="#ffffff" className="h-5 w-5" />
                  </div>
                  <span className='text-2xl font-bold tracking-tight'>
                     Ticket<span className="text-primary">Bari</span>
                  </span>
               </div>

               <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold tracking-tight">Login to your account</CardTitle>
                  <CardDescription>
                     Enter your email below to login to your account
                  </CardDescription>
               </div>
            </CardHeader>

            <CardContent>
               <form onSubmit={onSubmit}>
                  <FieldGroup >
                     
                     <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                     </Field>
                     
                     <Field>
                        <div className="flex items-center">
                           <FieldLabel htmlFor="password">Password</FieldLabel>
                        </div>
                        <Input id="password" name="password" type="password" required />
                     </Field>

                     <FieldGroup className="pt-2 space-y-3">
                        <Button type="submit" className="w-full font-semibold">
                           Login
                        </Button>

                        <div className="relative my-2">
                           <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                           </div>
                           <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or connect with</span>
                           </div>
                        </div>

                        <Button onClick={handleGoogleLogin} variant="outline" type="button" className="w-full">
                           <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                           Login with Google
                        </Button>

                        <FieldDescription className="pt-2 text-center text-sm">
                           Don&apos;t have an account?{" "}
                           <Link href="/signup" className="underline font-medium text-primary hover:text-primary/90">
                              Sign up
                           </Link>
                        </FieldDescription>
                     </FieldGroup>

                  </FieldGroup>
               </form>
            </CardContent>
         </Card>
      </div>
   );
}