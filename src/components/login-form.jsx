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
      const data = await authClient.signIn.social({
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
      <div className={cn("flex flex-col gap-6", className)} {...props}>
         <Card>
            <CardHeader>
               <CardTitle>Login to your account</CardTitle>
               <CardDescription>
                  Enter your email below to login to your account
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={onSubmit}>
                  <FieldGroup>
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
                     <Field>
                        <Button type="submit">Login</Button>
                        <Button onClick={handleGoogleLogin} variant="outline" type="button">
                           <FaGoogle className="mr-2" />
                           Login with Google
                        </Button>
                        <FieldDescription className="text-center">
                           Don&apos;t have an account?{" "}
                           <Link href="/signup">Sign up</Link>
                        </FieldDescription>
                     </Field>
                  </FieldGroup>
               </form>
            </CardContent>
         </Card>
      </div>
   );
}
