import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Create admin client for webhook operations
const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // This is the service role key, not anon key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Define the webhook event types
interface WebhookPayload {
  meta: {
    event_name: string;
    webhook_id: string;
    test_mode: boolean;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status?: string;
      user_email?: string;
      user_name?: string;
      product_id?: number;
      variant_id?: number;
      customer_id?: number;
      order_id?: number;
      cancelled_at?: string;
      ends_at?: string;
      renews_at?: string;
      urls?: {
        customer_portal?: string;
        update_payment_method?: string;
      };
      first_subscription_item?: {
        subscription_id: number;
        price_id: number;
        quantity: number;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    
    // Get the signature from headers
    const signature = request.headers.get('X-Signature') || 
                     request.headers.get('x-signature');
    
    // Verify the webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET; // Fixed: use correct env var name
    
    if (secret) {
      // LemonSqueezy uses HMAC-SHA256 for signatures
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(rawBody).digest('hex');
      
      if (signature !== digest) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('LEMONSQUEEZY_WEBHOOK_SECRET not set - skipping signature verification');
    }
    
    // Parse the webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    
    // Extract event details
    const { meta, data } = payload;
    const eventName = meta.event_name;
    
    console.log(`Received LemonSqueezy webhook: ${eventName}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Initialize Supabase admin client
    const supabase = createAdminClient();
    
    // Handle different event types
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(payload, supabase);
        break;
        
      case 'subscription_created':
        await handleSubscriptionCreated(payload, supabase);
        break;
        
      case 'subscription_updated':
        await handleSubscriptionUpdated(payload, supabase);
        break;
        
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(payload, supabase);
        break;
        
      case 'subscription_paused':
        await handleSubscriptionPaused(payload, supabase);
        break;
        
      case 'subscription_resumed':
        await handleSubscriptionResumed(payload, supabase);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventName}`);
    }
    
    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle order creation (initial purchase)
async function handleOrderCreated(payload: WebhookPayload, supabase: any) {
  const { data } = payload;
  const { user_email, order_id } = data.attributes;
  
  console.log(`New order created for ${user_email}, Order ID: ${order_id}`);
  
  if (!user_email) {
    console.log('No user email found in order');
    return;
  }

  // Find user by email
  let { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', user_email)
    .maybeSingle();

  if (findError) {
    console.error('Error finding user:', findError);
    return;
  }

  if (!profile) {
    console.log('User not found for email:', user_email);
    return;
  }

  console.log('Order created successfully processed for:', user_email);
}

// Handle subscription creation
async function handleSubscriptionCreated(payload: WebhookPayload, supabase: any) {
  
  const { data } = payload;
  const { 
    user_email, 
    status, 
    customer_id,
    product_id,
    variant_id,
    urls
  } = data.attributes;
  
  console.log(`Subscription created for ${user_email}`);
  console.log(`Status: ${status}`);
  
  if (!user_email) {
    console.log('No user email found in subscription');
    return;
  }

  // Debug: Check what users exist in database
  console.log('Searching for user with email:', user_email);
  
  // First, let's see what users exist
  const { data: allProfiles, error: allError } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(5);
    
  console.log('Sample profiles in database:', allProfiles);

  // Try exact match first
  let { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', user_email)
    .maybeSingle();

  if (findError) {
    console.error('Error with exact match:', findError);
  }

  if (!profile) {
    // Try case-insensitive search
    console.log('Trying case-insensitive search...');
    const { data: profileIlike, error: ilikeError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', user_email)
      .maybeSingle();
      
    if (ilikeError) {
      console.error('Error with ilike search:', ilikeError);
    }
    
    if (!profileIlike) {
      console.log('User not found for email:', user_email);
      console.log('Available emails:', allProfiles?.map((p: any) => p.email));      
      // Create a new profile for this user
      console.log('Creating new profile for user:', user_email);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: user_email,
          user_id: user_email, // Use email as user_id for now
          subscription_status: 'trial',
          trial_minutes_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating profile:', createError);
        return;
      }
      
      profile = newProfile;
      console.log('Created new profile:', profile.id);
    } else {
      profile = profileIlike;
    }
  }

  // Determine subscription plan
  const plan = variant_id === 2 ? 'yearly' : 'monthly'; // Adjust based on your variant IDs
  
  // Update user subscription status with enhanced data
  const updateData: any = {
    subscription_status: 'active',
    subscription_id: data.id,
    subscription_plan: plan,
    subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  // Add customer ID if available
  if (customer_id) {
    updateData.lemon_customer_id = customer_id.toString();
  }

  // Add customer portal URL if available
  if (urls?.customer_portal) {
    updateData.customer_portal_url = urls.customer_portal;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  console.log('Successfully activated subscription for:', user_email);
}

// Handle subscription updates
async function handleSubscriptionUpdated(payload: WebhookPayload, supabase: any) {
  const { data } = payload;
  const { 
    user_email, 
    status,
    customer_id,
    urls
  } = data.attributes;
  
  console.log(`Subscription updated for ${user_email}`);
  console.log(`New status: ${status}`);
  
  if (!user_email) {
    console.log('No user email found in subscription update');
    return;
  }

  // Find user by email
  let { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', user_email)
    .maybeSingle();

  if (findError) {
    console.error('Error finding user:', findError);
    return;
  }

  if (!profile) {
    console.log('User not found for email:', user_email);
    return;
  }

  // Update subscription status with enhanced data
  const updateData: any = {
    subscription_status: status === 'active' ? 'active' : 'cancelled',
    updated_at: new Date().toISOString()
  };

  // Add customer ID if available
  if (customer_id) {
    updateData.lemon_customer_id = customer_id.toString();
  }

  // Add customer portal URL if available
  if (urls?.customer_portal) {
    updateData.customer_portal_url = urls.customer_portal;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  console.log('Subscription update successfully processed for:', user_email);
}

// Handle subscription cancellation with enhanced data tracking
async function handleSubscriptionCancelled(payload: WebhookPayload, supabase: any) {
  const { data } = payload;
  const { 
    user_email, 
    customer_id, 
    cancelled_at, 
    ends_at,
    urls
  } = data.attributes;
  
  console.log(`Subscription cancelled for ${user_email}`);
  console.log(`Cancelled at: ${cancelled_at}`);
  console.log(`Ends at: ${ends_at}`);
  
  if (!user_email) {
    console.log('No user email found in subscription cancellation');
    return;
  }

  // Find user by email
  let { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', user_email)
    .maybeSingle();

  if (findError) {
    console.error('Error finding user:', findError);
    return;
  }

  if (!profile) {
    console.log('User not found for email:', user_email);
    return;
  }

  // Prepare comprehensive cancellation data
  const updateData: any = {
    subscription_status: 'cancelled',
    updated_at: new Date().toISOString()
  };

  // Add customer ID if available
  if (customer_id) {
    updateData.lemon_customer_id = customer_id.toString();
  }

  // Add customer portal URL if available
  if (urls?.customer_portal) {
    updateData.customer_portal_url = urls.customer_portal;
  }

  // Add cancellation timestamp if available
  if (cancelled_at) {
    updateData.cancelled_at = cancelled_at;
  }

  // Update subscription end date if available
  if (ends_at) {
    updateData.subscription_end_date = ends_at;
  }

  // If no cancellation reason was provided by user, set a default
  if (!profile.cancellation_reason) {
    updateData.cancellation_reason = 'webhook_cancelled';
    updateData.cancellation_feedback = 'Subscription cancelled via LemonSqueezy webhook';
  }

  // Update subscription with enhanced cancellation data
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  // Log comprehensive cancellation data
  console.log('Subscription cancellation successfully processed for:', user_email);
  console.log('Cancellation data:', {
    user_id: profile.id,
    customer_id,
    cancelled_at,
    ends_at,
    has_portal_url: !!urls?.customer_portal,
    existing_reason: profile.cancellation_reason,
    existing_feedback: profile.cancellation_feedback
  });

  // TODO: Send cancellation notification email
  // TODO: Update analytics/metrics
  // TODO: Trigger any post-cancellation workflows
}

// Handle subscription paused
async function handleSubscriptionPaused(payload: WebhookPayload, supabase: any) {
  const { data } = payload;
  const { user_email, customer_id, urls } = data.attributes;
  
  console.log(`Subscription paused for ${user_email}`);
  
  if (!user_email) {
    console.log('No user email found in subscription pause');
    return;
  }

  // Find user by email
  let { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', user_email)
    .maybeSingle();

  if (findError) {
    console.error('Error finding user:', findError);
    return;
  }

  if (!profile) {
    console.log('User not found for email:', user_email);
    return;
  }

  // Update subscription status to paused
  const updateData: any = {
    subscription_status: 'paused',
    updated_at: new Date().toISOString()
  };

  // Add customer ID if available
  if (customer_id) {
    updateData.lemon_customer_id = customer_id.toString();
  }

  // Add customer portal URL if available
  if (urls?.customer_portal) {
    updateData.customer_portal_url = urls.customer_portal;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  console.log('Subscription pause successfully processed for:', user_email);
}

// Handle subscription resumed
async function handleSubscriptionResumed(payload: WebhookPayload, supabase: any) {
  const { data } = payload;
  const { user_email, customer_id, urls } = data.attributes;
  
  console.log(`Subscription resumed for ${user_email}`);
  
  if (!user_email) {
    console.log('No user email found in subscription resume');
    return;
  }

  // Find user by email
  let { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', user_email)
    .maybeSingle();

  if (findError) {
    console.error('Error finding user:', findError);
    return;
  }

  if (!profile) {
    console.log('User not found for email:', user_email);
    return;
  }

  // Update subscription status to active
  const updateData: any = {
    subscription_status: 'active',
    updated_at: new Date().toISOString()
  };

  // Add customer ID if available
  if (customer_id) {
    updateData.lemon_customer_id = customer_id.toString();
  }

  // Add customer portal URL if available
  if (urls?.customer_portal) {
    updateData.customer_portal_url = urls.customer_portal;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  console.log('Subscription resume successfully processed for:', user_email);
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}
