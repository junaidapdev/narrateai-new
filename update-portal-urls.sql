-- Update customer portal URLs for testing
-- Replace 'your-customer-id' with actual LemonSqueezy customer IDs
-- Replace 'your-portal-url' with actual portal URLs

UPDATE public.profiles 
SET customer_portal_url = 'https://narrateai.lemonsqueezy.com/checkout/buy/your-portal-url'
WHERE lemon_customer_id IS NOT NULL;

-- Or set a default portal URL for all users
UPDATE public.profiles 
SET customer_portal_url = 'https://narrateai.lemonsqueezy.com/checkout/buy/your-default-portal-url'
WHERE customer_portal_url IS NULL;
