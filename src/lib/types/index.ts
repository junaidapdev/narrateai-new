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
  created_at: string
  updated_at: string
}

// Subscription types
export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  plan: 'free' | 'pro' | 'enterprise'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
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

