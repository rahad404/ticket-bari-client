'use client'

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { PlaneTakeoff, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/lib/auth-client";

export function SignupForm({ ...props }) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [userType, setUserType] = useState("user"); // defaults to normal user
   const [imageFile, setImageFile] = useState(null);
   const [imagePreview, setImagePreview] = useState("");

   // Handles local state update for chosen profile picture
   const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
         setImageFile(file);
         setImagePreview(URL.createObjectURL(file));
      }
   };

   // Uploads the image file directly to ImgBB via API
   const uploadToImgBB = async (file) => {
      const apiKey = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
      if (!apiKey) {
         throw new Error("Image upload API key configuration is missing.");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
         method: "POST",
         body: formData,
      });

      const result = await response.json();
      if (!result.success) {
         throw new Error(result.error?.message || "Failed to upload image to ImgBB");
      }

      return result.data.url; // Returns hosted URL
   };

   // Email Registration Flow
   const onSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const formData = new FormData(e.currentTarget);
      const userData = Object.fromEntries(formData.entries());

      try {
         let uploadedImageUrl = "";

         if (imageFile) {
            toast.loading("Uploading your profile image...", { id: "uploading" });
            uploadedImageUrl = await uploadToImgBB(imageFile);
            toast.dismiss("uploading");
         } else {
            toast.error("Please pick a profile picture before signing up.");
            setLoading(false);
            return;
         }

         const { data, error } = await authClient.signUp.email({
            email: userData.email,
            password: userData.password,
            name: userData.name,
            image: uploadedImageUrl,
            role: userType,
            fetchOptions: {
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
         toast.dismiss("uploading");
         toast.error(err.message || "Something went wrong. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   // Social Authentication Flow
   const handleGoogleLogin = async () => {
      setLoading(true);
      try {
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
      <Card className="w-full max-w-md mx-auto overflow-hidden border-t-4 border-t-primary" {...props}>
         <CardHeader className="space-y-2 text-center">
            <div className="space-y-2">
               <CardTitle className="text-xl font-semibold tracking-tight">Create an account</CardTitle>
               <CardDescription>
                  Enter your details to register your brand new account
               </CardDescription>
            </div>
         </CardHeader>

         <CardContent >
            <form onSubmit={onSubmit}>
               <FieldGroup>

                  {/* Account Type Selection Row */}
                  <Field>
                     <FieldLabel className="text-sm font-medium">Join As A</FieldLabel>
                     <input type="hidden" name="role" value={userType} />
                     <RadioGroup
                        defaultValue="user"
                        value={userType}
                        onValueChange={setUserType}
                        className="grid grid-cols-2 gap-4"
                        disabled={loading}
                     >
                        <div>
                           <RadioGroupItem value="user" id="r-user" className="peer sr-only" />
                           <label
                              htmlFor="r-user"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                           >
                              <span className="text-sm font-medium">Normal User</span>
                           </label>
                        </div>
                        <div>
                           <RadioGroupItem value="vendor" id="r-vendor" className="peer sr-only" />
                           <label
                              htmlFor="r-vendor"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                           >
                              <span className="text-sm font-medium">Vendor</span>
                           </label>
                        </div>
                     </RadioGroup>
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="name">Full Name</FieldLabel>
                     <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={loading} />
                  </Field>

                  {/* Modernized Image File Upload Block */}
                  <Field >
                     <FieldLabel htmlFor="avatar-upload">Profile Picture</FieldLabel>
                     <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 bg-muted overflow-hidden">
                           {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                           ) : (
                              <Upload className="h-5 w-5 text-muted-foreground" />
                           )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                           <Input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              required
                              disabled={loading}
                              onChange={handleImageChange}
                              className="cursor-pointer file:text-primary file:font-semibold"
                           />
                        </div>
                     </div>
                  </Field>

                  <Field>
                     <FieldLabel htmlFor="email">Email</FieldLabel>
                     <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={loading} />
                  </Field>

                  <Field className="space-y-1">
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
                     <FieldDescription className="text-[11px] leading-tight text-muted-foreground">
                        Length must be at least 6 characters, with an uppercase letter and a lowercase letter.
                     </FieldDescription>
                  </Field>

                  <FieldGroup className="pt-2 space-y-3">
                     <Button type="submit" className="w-full font-semibold" disabled={loading}>
                        {loading ? (
                           <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing Registration...
                           </>
                        ) : (
                           "Create Account"
                        )}
                     </Button>

                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                           <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                           <span className="bg-background px-2 text-muted-foreground">Or connect with</span>
                        </div>
                     </div>

                     <Button onClick={handleGoogleLogin} variant="outline" type="button" className="w-full" disabled={loading}>
                        <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                        Sign up with Google
                     </Button>

                     <FieldDescription className="pt-2 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline font-medium text-primary hover:text-primary/90">
                           Sign in
                        </Link>
                     </FieldDescription>
                  </FieldGroup>

               </FieldGroup>
            </form>
         </CardContent>
      </Card>
   );
}