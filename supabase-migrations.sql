-- Create linkedin_connections table
CREATE TABLE IF NOT EXISTS public.linkedin_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    linkedin_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    linkedin_profile_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to prevent duplicate connections per user
CREATE UNIQUE INDEX IF NOT EXISTS linkedin_connections_user_id_unique 
ON public.linkedin_connections(user_id) 
WHERE is_active = true;

-- Create index for LinkedIn user ID lookups
CREATE INDEX IF NOT EXISTS linkedin_connections_linkedin_user_id_idx 
ON public.linkedin_connections(linkedin_user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own LinkedIn connections
CREATE POLICY "Users can view own linkedin connections" ON public.linkedin_connections
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own LinkedIn connections
CREATE POLICY "Users can insert own linkedin connections" ON public.linkedin_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own LinkedIn connections
CREATE POLICY "Users can update own linkedin connections" ON public.linkedin_connections
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own LinkedIn connections
CREATE POLICY "Users can delete own linkedin connections" ON public.linkedin_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Add scheduled_at and linkedin_post_id columns to posts table if they don't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS linkedin_post_id TEXT;

-- Create scheduled_posts table for better tracking
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    linkedin_post_id TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scheduled_posts
CREATE INDEX IF NOT EXISTS scheduled_posts_scheduled_at_idx 
ON public.scheduled_posts(scheduled_at);

CREATE INDEX IF NOT EXISTS scheduled_posts_status_idx 
ON public.scheduled_posts(status);

CREATE INDEX IF NOT EXISTS scheduled_posts_user_id_idx 
ON public.scheduled_posts(user_id);

-- Add RLS for scheduled_posts
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own scheduled posts
CREATE POLICY "Users can view own scheduled posts" ON public.scheduled_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own scheduled posts
CREATE POLICY "Users can insert own scheduled posts" ON public.scheduled_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own scheduled posts
CREATE POLICY "Users can update own scheduled posts" ON public.scheduled_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own scheduled posts
CREATE POLICY "Users can delete own scheduled posts" ON public.scheduled_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_linkedin_connections_updated_at 
    BEFORE UPDATE ON public.linkedin_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at 
    BEFORE UPDATE ON public.scheduled_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
