'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, PlusCircle, UploadCloud, ShieldAlert } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const PERK_OPTIONS = [
   { id: 'ac', label: 'Air Conditioned (AC)' },
   { id: 'breakfast', label: 'Complimentary Breakfast' },
   { id: 'wifi', label: 'Free Wi-Fi' },
   { id: 'blanket', label: 'Blanket & Pillow' },
   { id: 'charging', label: 'Charging Outlets' },
];

export default function AddTicket({ user }) {
   const { data: session } = authClient.useSession();
   const currentUser = user || session?.user;
   const isVendorFraudulent = currentUser?.isFraud === true;
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [imagePreview, setImagePreview] = useState(null);
   const [selectedImageFile, setSelectedImageFile] = useState(null);

   // Re-fetch session from server on mount and on tab focus to ensure isFraud
   // status is always current (admin may have flagged this vendor as fraud).
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

   const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
      defaultValues: {
         title: '',
         fromLocation: '',
         toLocation: '',
         transportType: '',
         price: '',
         quantity: '',
         departureDateTime: '',
         perks: [],
      }
   });

   const selectedPerks = watch('perks');

   const handlePerkChange = (perkId, checked) => {
      if (checked) {
         setValue('perks', [...selectedPerks, perkId]);
      } else {
         setValue('perks', selectedPerks.filter((id) => id !== perkId));
      }
   };

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setSelectedImageFile(file);
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
         throw new Error('Image upload failed');
      }

      const data = await response.json();
      return data.data.url; // Returns the direct display link
   };

   const onSubmit = async (data) => {
      if (isVendorFraudulent) {
         toast.error('Action Denied', {
            description: 'Fraudulent vendor profiles are restricted from publishing new listings.',
         });
         return;
      }

      if (!selectedImageFile) {
         toast.error('Image Required', {
            description: 'Please upload a thumbnail image for your transit ticket.',
         });
         return;
      }

      setIsSubmitting(true);

      try {
         // 1. Upload thumbnail image to ImgBB
         const imageUrl = await uploadToImgBB(selectedImageFile);

         // 2. Format structure for backend storage matches
         const payload = {
            title: data.title,
            from: data.fromLocation,
            to: data.toLocation,
            transportType: data.transportType,
            price: parseFloat(data.price),
            quantity: parseInt(data.quantity, 10),
            departureDateTime: data.departureDateTime,
            perks: data.perks,
            imageUrl: imageUrl,
            vendorName: currentUser?.name,
            vendorEmail: currentUser?.email,
         };

         // 3. Get JWT token from better-auth
         const { data: { token: jwtToken } } = await authClient.token();

         // 4. Post to the backend route
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            throw new Error('Could not persist ticket to local collection database');
         }

         toast.success('Ticket Submitted Successfully', {
            description: 'Your ticket is now listed as pending review by operational administrators.',
         });

         // Clear layout fields
         reset();
         setImagePreview(null);
         setSelectedImageFile(null);

      } catch (error) {
         console.error(error);
         toast.error('Submission Interrupted', {
            description: error.message || 'An unexpected operational error took place.',
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="max-w-3xl mx-auto p-2">
         {isVendorFraudulent && (
            <Alert variant="destructive" className="mb-6 border-red-600 bg-red-50 dark:bg-red-950/20">
               <ShieldAlert className="h-5 w-5" />
               <AlertTitle className="font-bold">Creation Blocked</AlertTitle>
               <AlertDescription>
                  Your account has structural fraud flags. The platform blocks manual submission entries until clearance operations finish.
               </AlertDescription>
            </Alert>
         )}

         <Card className="shadow-md border-muted">
            <CardHeader>
               <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <PlusCircle className="h-6 w-6 text-primary" />
                  Create Ticket Package
               </CardTitle>
               <CardDescription>
                  Fill out journey data. Initial listings post directly into <b>Pending</b> queues until Admin clearance.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Ticket Title */}
                  <div className="space-y-2">
                     <Label htmlFor="title">Ticket Title / Transit Heading</Label>
                     <Input
                        id="title"
                        disabled={isVendorFraudulent}
                        placeholder="e.g., Premium AC Sleeper - Dhaka to Cox's Bazar"
                        {...register('title', { required: 'Provide descriptive booking context title' })}
                     />
                     {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                  </div>

                  {/* From & To Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="fromLocation">From (Departure Station)</Label>
                        <Input
                           id="fromLocation"
                           disabled={isVendorFraudulent}
                           placeholder="e.g., Dhaka"
                           {...register('fromLocation', { required: 'Departure starting station required' })}
                        />
                        {errors.fromLocation && <p className="text-xs text-destructive">{errors.fromLocation.message}</p>}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="toLocation">To (Destination Station)</Label>
                        <Input
                           id="toLocation"
                           disabled={isVendorFraudulent}
                           placeholder="e.g., Cox's Bazar"
                           {...register('toLocation', { required: 'Terminal destination required' })}
                        />
                        {errors.toLocation && <p className="text-xs text-destructive">{errors.toLocation.message}</p>}
                     </div>
                  </div>

                  {/* Transport Type, Price, Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="transportType">Transport Fleet Type</Label>
                        <Select
                           disabled={isVendorFraudulent}
                           onValueChange={(val) => setValue('transportType', val)}
                        >
                           <SelectTrigger id="transportType">
                              <SelectValue placeholder="Select vehicle type" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="bus">Bus</SelectItem>
                              <SelectItem value="train">Train</SelectItem>
                              <SelectItem value="air">Air / Plane</SelectItem>
                              <SelectItem value="launch">Launch / Ferry</SelectItem>
                           </SelectContent>
                        </Select>
                        <input
                           type="hidden"
                           {...register('transportType', { required: 'Please specify fleet type' })}
                        />
                        {errors.transportType && <p className="text-xs text-destructive">{errors.transportType.message}</p>}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="price">Price (Per Unit Ticket)</Label>
                        <Input
                           id="price"
                           type="number"
                           step="0.01"
                           disabled={isVendorFraudulent}
                           placeholder="0.00"
                           {...register('price', {
                              required: 'Ticket pricing parameter needed',
                              min: { value: 1, message: 'Price metrics must clear absolute floor boundaries (>0)' }
                           })}
                        />
                        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="quantity">Available Allocation Capacity</Label>
                        <Input
                           id="quantity"
                           type="number"
                           disabled={isVendorFraudulent}
                           placeholder="Total allotments"
                           {...register('quantity', {
                              required: 'Provide initial count values',
                              min: { value: 1, message: 'Must supply at least 1 ticket unit' }
                           })}
                        />
                        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
                     </div>
                  </div>

                  {/* Departure Timeline Date/Time Picker */}
                  <div className="space-y-2">
                     <Label htmlFor="departureDateTime">Departure Timeline Schedule Date & Time</Label>
                     <Input
                        id="departureDateTime"
                        type="datetime-local"
                        disabled={isVendorFraudulent}
                        {...register('departureDateTime', { required: 'Provide specific deployment schedules' })}
                     />
                     {errors.departureDateTime && <p className="text-xs text-destructive">{errors.departureDateTime.message}</p>}
                  </div>

                  {/* Perks Options Checkboxes */}
                  <div className="space-y-3">
                     <Label className="text-base font-semibold">Included Amenities & Perks</Label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/20">
                        {PERK_OPTIONS.map((perk) => (
                           <div key={perk.id} className="flex items-center space-x-2">
                              <Checkbox
                                 id={perk.id}
                                 disabled={isVendorFraudulent}
                                 checked={selectedPerks?.includes(perk.id)}
                                 onCheckedChange={(checked) => handlePerkChange(perk.id, checked)}
                              />
                              <label
                                 htmlFor={perk.id}
                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                 {perk.label}
                              </label>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* ImgBB Image Upload Input Block */}
                  <div className="space-y-2">
                     <Label>Thumbnail Banner Image Asset</Label>
                     <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-colors relative">
                        <input
                           type="file"
                           accept="image/*"
                           disabled={isVendorFraudulent}
                           onChange={handleImageChange}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />

                        {imagePreview ? (
                           <div className="relative w-full max-h-48 overflow-hidden rounded-md flex justify-center">
                              <img src={imagePreview} alt="Preview asset upload" className="object-cover max-h-44 rounded" />
                           </div>
                        ) : (
                           <div className="flex flex-col items-center text-muted-foreground py-4">
                              <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground/80" />
                              <span className="text-sm font-medium">Click or Drag to Upload Fleet Artwork</span>
                              <span className="text-xs opacity-70 mt-1">PNG, JPG up to 5MB (Processed via ImgBB)</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Read-Only Vendor Credentials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-muted">
                     <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Operating Vendor Entity</Label>
                        <Input value={currentUser?.name || ''} readOnly className="bg-muted text-muted-foreground text-sm cursor-not-allowed" />
                     </div>
                     <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Registered Profile Route Identifier</Label>
                        <Input value={currentUser?.email || ''} readOnly className="bg-muted text-muted-foreground text-sm cursor-not-allowed" />
                     </div>
                  </div>

                  {/* Action Trigger Button */}
                  <Button
                     type="submit"
                     className="w-full font-semibold"
                     disabled={isSubmitting || isVendorFraudulent}
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Uploading Asset Packages...
                        </>
                     ) : (
                        'Add Ticket Component Package'
                     )}
                  </Button>

               </form>
            </CardContent>
         </Card>
      </div>
   );
}