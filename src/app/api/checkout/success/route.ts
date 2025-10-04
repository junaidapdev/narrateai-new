// app/api/checkout/success/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Checkout success endpoint hit');
    
    // Get checkout parameters from LemonSqueezy
    const searchParams = request.nextUrl.searchParams;
    const checkoutId = searchParams.get('checkout_id');
    const orderId = searchParams.get('order_id');
    const variantId = searchParams.get('variant_id');
    
    console.log('Checkout details:', {
      checkoutId,
      orderId,
      variantId
    });
    
    // Build the redirect URL to your payment-success page
    const successUrl = new URL('/payment-success', request.url);
    
    // Pass relevant parameters to the success page if needed
    if (checkoutId) successUrl.searchParams.set('checkout_id', checkoutId);
    if (orderId) successUrl.searchParams.set('order_id', orderId);
    
    console.log('Redirecting to:', successUrl.toString());
    
    // Redirect to your payment-success page
    return NextResponse.redirect(successUrl);
    
  } catch (error) {
    console.error('Checkout success handler error:', error);
    
    // On error, still redirect but with error flag
    const errorUrl = new URL('/payment-success', request.url);
    errorUrl.searchParams.set('status', 'error');
    
    return NextResponse.redirect(errorUrl);
  }
}