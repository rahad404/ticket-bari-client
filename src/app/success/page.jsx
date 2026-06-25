import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { stripe } from '@/lib/stripe'

export default async function Success({ searchParams }) {
   const { session_id } = await searchParams

   if (!session_id) {
      return redirect('/')
   }

   const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent'],
   })

   if (session.status === 'open') {
      return redirect('/')
   }

   if (session.status === 'complete') {
      const bookingId = session.metadata?.bookingId
      const email = session.metadata?.email
      const paymentIntent = session.payment_intent
      const transactionId = paymentIntent.id
      const amount = paymentIntent.amount_received / 100

      if (bookingId && transactionId) {
         try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ bookingId, transactionId, amount, email }),
            })
         } catch (err) {
            console.error('Failed to record payment:', err)
         }
      }

      const customerEmail = session.customer_details?.email || email

      return (
         <div className="min-h-svh flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
               <div className="flex justify-center">
                  <div className="bg-emerald-100 dark:bg-emerald-950/30 p-4 rounded-full">
                     <CheckCircle className="h-12 w-12 text-emerald-600" />
                  </div>
               </div>
               <h1 className="text-2xl font-bold tracking-tight">Payment Successful!</h1>
               <p className="text-muted-foreground">
                  Thank you for your purchase. A confirmation will be sent to{' '}
                  <strong>{customerEmail}</strong>.
               </p>
               <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                     <span className="text-muted-foreground">Transaction ID</span>
                     <span className="font-mono text-xs">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-muted-foreground">Amount Paid</span>
                     <span className="font-bold">${Number(amount).toFixed(2)}</span>
                  </div>
               </div>
               <div className="flex gap-3 justify-center">
                  <Link href="/dashboard/user/my-bookings">
                     <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        View My Bookings
                     </button>
                  </Link>
                  <Link href="/all-tickets">
                     <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent">
                        Browse More Tickets
                     </button>
                  </Link>
               </div>
            </div>
         </div>
      )
   }
}
