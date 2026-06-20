'use client'

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function SignupForm({ ...props }) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);

   // Email Submit Handler
   const onSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const formData = new FormData(e.currentTarget);
      const userData = Object.fromEntries(formData.entries());

      try {
         const { data, error } = await authClient.signUp.email({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            image: userData.image,
            options: {
               disableAutoSignIn: true,
            },
         });

         if (error) {
            toast.error(error.message);
            return;
         }

         if (data) {
            toast.success("Account created successfully!");
            router.push("/login");
         }
      } catch (err) {
         toast.error("Something went wrong. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   // Google Login Handler
   const handleGoogleLogin = async () => {
      setLoading(true);
      try {
         // Destructured both data and error cleanly from the client call
         const { data, error } = await authClient.signIn.social({
            provider: "google",
         });

         if (error) {
            toast.error(error.message);
            return;
         }

         if (data) {
            toast.success("Logged in successfully!");
            router.push("/");
         }
      } catch (err) {
         toast.error("Google authentication failed.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Card {...props}>
         <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
               Enter your information below to create your account
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={onSubmit}>
               <FieldGroup>
                  <Field>
                     <FieldLabel htmlFor="name">Full Name</FieldLabel>
                     <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={loading} />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="image">Image URL</FieldLabel>
                     <Input id="image" name="image" type="text" placeholder="Profile Image URL" disabled={loading} required />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="email">Email</FieldLabel>
                     <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={loading} />
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="password">Password</FieldLabel>
                     <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
                        title="Must be at least 6 characters long and include both uppercase and lowercase letters."
                        disabled={loading}
                     />
                     <FieldDescription>
                        Length must be at least 6 characters, with an uppercase letter and a lowercase letter.
                     </FieldDescription>
                  </Field>

                  <FieldGroup>
                     <Field className="space-y-3">
                        {/* Removed onClick={onSubmit} to stop double execution */}
                        <Button type="submit" className="w-full" disabled={loading}>
                           {loading ? "Creating Account..." : "Create Account"}
                        </Button>

                        <Button onClick={handleGoogleLogin} variant="outline" type="button" className="w-full" disabled={loading}>
                           <FaGoogle className="mr-2" />
                           Sign up with Google
                        </Button>

                        <FieldDescription className="pt-2 text-center">
                           Already have an account?{" "}
                           <Link href="/login" className="underline text-primary hover:text-primary/90">
                              Sign in
                           </Link>
                        </FieldDescription>
                     </Field>
                  </FieldGroup>
               </FieldGroup>
            </form>
         </CardContent>
      </Card>
   );
}
