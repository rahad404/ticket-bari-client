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
import { Loader2, User, Mail, ShieldCheck, UserCheck, ImagePlus, CheckCircle } from 'lucide-react';

export default function VendorProfile({ user }) {
   // Pulling live data hooks from better auth client
   const { data: session } = authClient.useSession();
   const currentUser = user || session?.user;

   const [isSubmitting, setIsSubmitting] = useState(false);
   const [imagePreview, setImagePreview] = useState(null);
   const [selectedFile, setSelectedFile] = useState(null);

   const { register, handleSubmit, reset, formState: { errors } } = useForm({
      defaultValues: {
         name: '',
      }
   });

   // Sync react-hook-form when user data updates
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
         throw new Error('Avatar upload operation failed via ImgBB router.');
      }

      const data = await response.json();
      return data.data.url;
   };

   const onSubmit = async (data) => {
      if (!currentUser?.id && !currentUser?._id) {
         toast.error('Identity Error', { description: 'Missing active user database unique signature identifier.' });
         return;
      }

      const userId = currentUser.id || currentUser._id;
      setIsSubmitting(true);

      try {
         let finalImageUrl = currentUser.image;

         if (selectedFile) {
            finalImageUrl = await uploadToImgBB(selectedFile);
         }

         const payload = {
            name: data.name,
            image: finalImageUrl,
         };

         const { data: { token: jwtToken } } = await authClient.token();

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
            throw new Error(errorData.message || 'Could not patch profile records.');
         }

         toast.success('Profile Saved', { description: 'Your credentials have been successfully updated.' });

         // Clear the staging file input track
         setSelectedFile(null);

         // Force Better Auth context providers to fetch live state down from your session route
         if (typeof authClient.updateUser === 'function') {
            await authClient.updateUser({
               name: data.name,
               image: finalImageUrl,
            });
         } else if (typeof authClient.session?.refetch === 'function') {
            await authClient.session.refetch();
         } else {
            // Safe global context update fallback alternative
            window.location.reload();
         }

      } catch (error) {
         console.error(error);
         toast.error('Update Failed', { description: error.message });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-2">
         <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Vendor Management Identity</h2>
            <p className="text-muted-foreground text-sm">Review credentials or mutate public profile records.</p>
         </div>

         <Card className="shadow-md border-muted">
            <CardHeader className="pb-4">
               <CardTitle className="text-xl flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Account Overview
               </CardTitle>
               <CardDescription>
                  Manage profile presentation fields and access roles mapping structures.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Avatar Selection View Display Panel Frame */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border bg-muted/20">
                     <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-inner">
                           <AvatarImage src={imagePreview} className="object-cover" />
                           <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                              {currentUser?.name?.substring(0, 2).toUpperCase() || 'VN'}
                           </AvatarFallback>
                        </Avatar>

                        {/* Upload Hover Layer Overlays */}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium text-center p-1">
                           <ImagePlus className="h-4 w-4 mb-0.5" />
                           Change Image
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
                           <h3 className="text-lg font-bold text-foreground">{currentUser?.name || 'Loading Entity Name...'}</h3>
                           <Badge variant="outline" className="bg-primary/5 text-primary capitalize font-semibold border-primary/20">
                              <ShieldCheck className="h-3 w-3 mr-1 inline-block" />
                              {currentUser?.role || 'Vendor'}
                           </Badge>
                           {currentUser?.isFraud && (
                              <Badge variant="destructive" className="animate-pulse">Suspended / Fraud Flagged</Badge>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                           <Mail className="h-3.5 w-3.5 opacity-70" />
                           {currentUser?.email || 'No registry parameters connected'}
                        </p>
                     </div>
                  </div>

                  {/* Editable Form Controls */}
                  <div className="space-y-4 pt-2">
                     <div className="space-y-2">
                        <Label htmlFor="vendor-name" className="text-sm font-semibold">Vendor Legal / Entity Name</Label>
                        <div className="relative">
                           <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                           <Input
                              id="vendor-name"
                              placeholder="Enter entity name modification context"
                              className="pl-9"
                              {...register('name', { required: 'Profile display names cannot be parsed completely empty.' })}
                           />
                        </div>
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                     </div>

                     {/* Read Only Email Component Blocks */}
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

                  {/* Actions Triggers */}
                  <Button
                     type="submit"
                     className="w-full font-semibold shadow-sm"
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Committing Mutation Handshakes...
                        </>
                     ) : (
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Save Profiles Update</span>
                     )}
                  </Button>

               </form>
            </CardContent>
         </Card>
      </div>
   );
}