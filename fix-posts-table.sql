-- Fix posts table by adding missing columns and fixing foreign key

-- Step 1: Add missing content column if it doesn't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Step 2: Add other missing columns if they don't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Drop the existing foreign key constraint if it exists
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Step 4: Add the new foreign key constraint that references profiles
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 5: Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
ORDER BY ordinal_position;
