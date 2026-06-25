'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, User, Mail, ShieldCheck, UserCheck, ImagePlus, CheckCircle, ShieldAlert } from 'lucide-react';

export default function UserProfile({ user }) {
   // Pull live context from better-auth
   const { data: session } = authClient.useSession();

   // Reusable bridge: prioritizes an explicitly passed user object (e.g., admin editing a user), 
   // otherwise defaults to the currently authenticated session user.
   const currentUser = user || session?.user;

   const [isSubmitting, setIsSubmitting] = useState(false);
   const [imagePreview, setImagePreview] = useState(null);
   const [selectedFile, setSelectedFile] = useState(null);

   const { register, handleSubmit, reset, formState: { errors } } = useForm({
      defaultValues: {
         name: '',
      }
   });

   // Fetch a fresh session from the server when the profile page is mounted
   // and whenever the tab regains focus. This ensures isFraud / role changes
   // made by an admin are visible here immediately.
   useEffect(() => {
      authClient.getSession({ fetchOptions: { cache: 'no-store' } });

      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            authClient.getSession({ fetchOptions: { cache: 'no-store' } });
         }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
   }, []);

   // Sync react-hook-form fields cleanly whenever the user context loads or updates
   useEffect(() => {
      if (currentUser) {
         reset({
            name: currentUser.name || '',
         });
         setImagePreview(currentUser.image || null);
      }
   }, [currentUser, reset]);


   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setSelectedFile(file);
         setImagePreview(URL.createObjectURL(file));
      }
   };

   const uploadToImgBB = async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const imgbbApiKey = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
         method: 'POST',
         body: formData,
      });

      if (!response.ok) {
         throw new Error('Avatar image asset upload failed via ImgBB engine.');
      }

      const data = await response.json();
      return data.data.url;
   };

   const onSubmit = async (data) => {
      if (!currentUser?.id && !currentUser?._id) {
         toast.error('Identity Error', { description: 'Missing active user unique tracking identifier.' });
         return;
      }

      const userId = currentUser.id || currentUser._id;
      setIsSubmitting(true);

      try {
         let finalImageUrl = currentUser.image;

         // 1. Upload file if changed
         if (selectedFile) {
            finalImageUrl = await uploadToImgBB(selectedFile);
         }

         const payload = {
            name: data.name,
            image: finalImageUrl,
         };

         // 2. Fetch JWT token using your preferred pattern
         const { data: { token: jwtToken } } = await authClient.token();

         // 3. Patch profile changes down to backend
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Could not patch operational user records.');
         }

         toast.success('Profile Saved', { description: 'Your information has been successfully updated.' });
         setSelectedFile(null);

         // 4. Update frontend better-auth session natively to avoid a hard page refresh
         if (typeof authClient.updateUser === 'function') {
            await authClient.updateUser({
               name: data.name,
               image: finalImageUrl,
            });
         } else if (typeof authClient.session?.refetch === 'function') {
            await authClient.session.refetch();
         } else {
            window.location.reload();
         }

      } catch (error) {
         console.error(error);
         toast.error('Update Interrupted', { description: error.message });
      } finally {
         setIsSubmitting(false);
      }
   };

   // Helper function to colorize badges dynamically based on account type
   const getRoleBadgeVariant = (role) => {
      switch (role) {
         case 'admin': return 'bg-red-500 hover:bg-red-600 text-white border-none';
         case 'vendor': return 'bg-blue-500 hover:bg-blue-600 text-white border-none';
         default: return 'bg-slate-500 hover:bg-slate-600 text-white border-none';
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-2">
         {/* 1. Dynamic Page Heading Layout */}
         <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-2xl font-bold tracking-tight capitalize">
               {currentUser?.role || 'User'} Profile Settings
            </h2>
            <p className="text-muted-foreground text-sm">
               Review credentials and modify personal platform identity settings.
            </p>
         </div>

         {/* Conditional Warning Banner: Renders safely ONLY if user is a vendor AND flagged for fraud */}
         {currentUser?.role === 'vendor' && currentUser?.isFraud && (
            <div className="mb-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-start gap-3">
               <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
               <div>
                  <p className="font-bold">Account Under Restriction</p>
                  <p className="text-xs opacity-90 mt-0.5">This profile has structural restrictions. Ticket management functions are locked.</p>
               </div>
            </div>
         )}

         <Card className="shadow-md border-muted">
            <CardHeader className="pb-4">
               <CardTitle className="text-xl flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Account Overview
               </CardTitle>
               <CardDescription>
                  Manage profile fields and identity access variables.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Avatar Picker Panel */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border bg-muted/20">
                     <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-inner">
                           <AvatarImage src={imagePreview} className="object-cover" />
                           <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                              {currentUser?.name?.substring(0, 2).toUpperCase() || 'US'}
                           </AvatarFallback>
                        </Avatar>

                        {/* Upload Hover Layer Overlays */}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium text-center p-1">
                           <ImagePlus className="h-4 w-4 mb-0.5" />
                           Change Avatar
                           <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                           />
                        </label>
                     </div>

                     <div className="space-y-2 text-center sm:text-left flex-1 w-full">
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                           <h3 className="text-lg font-bold text-foreground">{currentUser?.name || 'Account Holder'}</h3>

                           {/* 2. Dynamic Badge Variant Generation */}
                           <Badge className={`capitalize font-semibold ${getRoleBadgeVariant(currentUser?.role)}`}>
                              <ShieldCheck className="h-3 w-3 mr-1 inline-block" />
                              {currentUser?.role || 'User'}
                           </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                           <Mail className="h-3.5 w-3.5 opacity-70" />
                           {currentUser?.email || 'No email attached'}
                        </p>
                     </div>
                  </div>

                  {/* Form Fields Section */}
                  <div className="space-y-4 pt-2">
                     <div className="space-y-2">
                        {/* 3. Generalized Dynamic Field Label Context */}
                        <Label htmlFor="user-name" className="text-sm font-semibold">Full Display Name</Label>
                        <div className="relative">
                           <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                           <Input
                              id="user-name"
                              placeholder="Enter your profile name"
                              className="pl-9"
                              {...register('name', { required: 'Display profile names cannot be left completely empty.' })}
                           />
                        </div>
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                     </div>

                     {/* Read Only/Immutable Email Address Segment */}
                     <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Account Connection Address (Immutable Routing Parameter)</Label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-40" />
                           <Input
                              value={currentUser?.email || ''}
                              readOnly
                              className="bg-muted pl-9 text-muted-foreground text-sm cursor-not-allowed select-none"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <Button
                     type="submit"
                     className="w-full font-semibold shadow-sm"
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Saving Profiles Updates...
                        </>
                     ) : (
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Save Changes</span>
                     )}
                  </Button>

               </form>
            </CardContent>
         </Card>
      </div>
   );
}