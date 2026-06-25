import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req) {
   try {
      const { bookingId, amount, email } = await req.json()

      if (!bookingId || !amount) {
         return NextResponse.json({ error: 'Missing bookingId or amount' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         line_items: [
            {
               price_data: {
                  currency: 'usd',
                  product_data: { name: 'Ticket Booking' },
                  unit_amount: Math.round(Number(amount) * 100),
               },
               quantity: 1,
            },
         ],
         mode: 'payment',
         success_url: `${process.env.BETTER_AUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
         cancel_url: `${process.env.BETTER_AUTH_URL}/dashboard/user/my-bookings`,
         metadata: { bookingId, email },
         customer_email: email,
      })

      return NextResponse.json({ url: session.url })
   } catch (err) {
      console.error('Stripe checkout session error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
   }
}
