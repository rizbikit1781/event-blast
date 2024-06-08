import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { IEvent } from '@/lib/database/models/event.model'
import { loadStripe } from '@stripe/stripe-js';


loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({ event, userId} : {event : IEvent, userId : string} ) => {
  
    useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
          console.log('Order placed! You will receive an email confirmation.');
        }
    
        if (query.get('canceled')) {
          console.log('Order canceled -- continue to shop around and checkout when you’re ready.');
        }
      }, []);

    const onCheckout = async () => {
        console.log('Checkout')
    }
  
    return (

    <form action={onCheckout} method="POST">
        <Button type="submit" role="link" size="lg" className='button sm:w-fit'>
            {event.isFree ? 'Get Ticket' : 'Buy Ticket'}
        </Button>
    </form>
  )
}

export default Checkout