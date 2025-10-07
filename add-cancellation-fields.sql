-- Add cancellation and billing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS customer_portal_url TEXT,
ADD COLUMN IF NOT EXISTS lemon_customer_id TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_feedback TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_lemon_customer_id_idx ON public.profiles(lemon_customer_id);
CREATE INDEX IF NOT EXISTS profiles_cancellation_reason_idx ON public.profiles(cancellation_reason);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON public.profiles(subscription_status);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.customer_portal_url IS 'LemonSqueezy customer portal URL for billing management';
COMMENT ON COLUMN public.profiles.lemon_customer_id IS 'LemonSqueezy customer ID for external billing system integration';
COMMENT ON COLUMN public.profiles.cancellation_reason IS 'Reason provided by user for subscription cancellation';
COMMENT ON COLUMN public.profiles.cancellation_feedback IS 'Additional feedback provided by user during cancellation';
