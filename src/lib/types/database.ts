export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: string
          subscription_id: string | null
          trial_minutes_used: number
          subscription_plan: string | null
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: string
          subscription_id?: string | null
          trial_minutes_used?: number
          subscription_plan?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: string
          subscription_id?: string | null
          trial_minutes_used?: number
          subscription_plan?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recordings: {
        Row: {
          id: string
          user_id: string
          title: string
          audio_url: string
          transcript: string | null
          duration: number | null
          status: 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          audio_url: string
          transcript?: string | null
          duration?: number | null
          status?: 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          audio_url?: string
          transcript?: string | null
          duration?: number | null
          status?: 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: string
          user_id: string
          recording_id: string | null
          title: string | null
          hook: string
          body: string
          call_to_action: string | null
          platform: string | null
          status: 'draft' | 'published' | 'scheduled'
          published_at: string | null
          scheduled_at: string | null
          linkedin_post_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recording_id?: string | null
          title?: string | null
          hook: string
          body: string
          call_to_action?: string | null
          platform?: string | null
          status?: 'draft' | 'published' | 'scheduled'
          published_at?: string | null
          scheduled_at?: string | null
          linkedin_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recording_id?: string | null
          title?: string | null
          hook?: string
          body?: string
          call_to_action?: string | null
          platform?: string | null
          status?: 'draft' | 'published' | 'scheduled'
          published_at?: string | null
          scheduled_at?: string | null
          linkedin_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_recording_id_fkey"
            columns: ["recording_id"]
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan: 'free' | 'pro' | 'enterprise'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan?: 'free' | 'pro' | 'enterprise'
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          plan?: 'free' | 'pro' | 'enterprise'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      linkedin_connections: {
        Row: {
          id: string
          user_id: string
          linkedin_user_id: string
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          linkedin_profile_data: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          linkedin_user_id: string
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          linkedin_profile_data?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          linkedin_user_id?: string
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          linkedin_profile_data?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_connections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      scheduled_posts: {
        Row: {
          id: string
          post_id: string
          user_id: string
          scheduled_at: string
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          linkedin_post_id: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          scheduled_at: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          linkedin_post_id?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          scheduled_at?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          linkedin_post_id?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

