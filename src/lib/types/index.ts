import { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// User types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Recording types
export interface Recording {
  id: string
  user_id: string
  title: string
  audio_url: string
  transcript?: string
  duration?: number
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

// Post types
export interface Post {
  id: string
  user_id: string
  recording_id?: string
  title?: string
  hook: string
  body: string
  call_to_action?: string
  platform?: string
  status: 'draft' | 'published' | 'scheduled'
  published_at?: string
  scheduled_at?: string
  linkedin_post_id?: string
  created_at: string
  updated_at: string
}

// Subscription types
export interface Subscription {
  id: string
  user_id: string
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
  subscription_id?: string
  trial_minutes_used: number
  subscription_plan?: 'monthly' | 'yearly'
  subscription_end_date?: string
  created_at: string
  updated_at: string
}

export interface TrialUsage {
  minutes_used: number
  minutes_limit: number
  is_trial: boolean
  can_record: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Form types
export interface SignInForm {
  email: string
  password: string
}

export interface SignUpForm {
  email: string
  password: string
  full_name: string
}

export interface ResetPasswordForm {
  email: string
}

export interface RecordingForm {
  title: string
  description?: string
  audio_file: File
}

export interface PostForm {
  title: string
  content: string
  recording_id?: string
}

// LinkedIn connection types
export interface LinkedInConnection {
  id: string
  user_id: string
  linkedin_user_id: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  linkedin_profile_data?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

// Scheduled post types
export interface ScheduledPost {
  id: string
  post_id: string
  user_id: string
  scheduled_at: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  linkedin_post_id?: string
  error_message?: string
  created_at: string
  updated_at: string
}

