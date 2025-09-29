-- Fix trial_minutes_used column to support decimal values
-- Change from INTEGER to DECIMAL(10,2) to support minutes with decimal precision

ALTER TABLE public.profiles 
ALTER COLUMN trial_minutes_used TYPE DECIMAL(10,2);

-- Update any existing integer values to decimal format
UPDATE public.profiles 
SET trial_minutes_used = trial_minutes_used::DECIMAL(10,2)
WHERE trial_minutes_used IS NOT NULL;
