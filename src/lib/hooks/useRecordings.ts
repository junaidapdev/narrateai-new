'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Recording } from '@/lib/types'

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      setRecordings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createRecording = async (recording: Omit<Recording, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Ensure user exists in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
          }])

        if (profileError) {
          console.error('Failed to create profile:', profileError)
          throw new Error('Failed to create user profile')
        }
      }

      console.log('Inserting recording with data:', { ...recording, user_id: user.id })

      const { data, error } = await supabase
        .from('recordings')
        .insert([{ ...recording, user_id: user.id }])
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Recording inserted successfully:', data)
      setRecordings(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('createRecording error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateRecording = async (id: string, updates: Partial<Recording>) => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setRecordings(prev => 
        prev.map(recording => 
          recording.id === id ? { ...recording, ...data } : recording
        )
      )
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const deleteRecording = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setRecordings(prev => prev.filter(recording => recording.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchRecordings()
  }, [])

  return {
    recordings,
    loading,
    error,
    fetchRecordings,
    createRecording,
    updateRecording,
    deleteRecording,
  }
}

