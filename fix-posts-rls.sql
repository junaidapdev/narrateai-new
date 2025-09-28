-- Fix Row Level Security policies for posts table

-- Step 1: Enable RLS on posts table (if not already enabled)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy for users to insert their own posts
CREATE POLICY "Users can insert their own posts" ON public.posts
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 3: Create policy for users to view their own posts
CREATE POLICY "Users can view their own posts" ON public.posts
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Step 4: Create policy for users to update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create policy for users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'posts';
