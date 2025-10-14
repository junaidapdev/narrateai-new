'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/lib/types'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      setPosts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...post, user_id: user.id }])
        .select()
        .single()

      if (error) {
        throw error
      }

      setPosts(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      console.log('updatePost called with:', { id, updates })
      
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      console.log('Database update successful:', data)

      setPosts(prev => 
        prev.map(post => 
          post.id === id ? { ...post, ...data } : post
        )
      )
      return data
    } catch (err) {
      console.error('updatePost error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setPosts(prev => prev.filter(post => post.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const publishPost = async (id: string) => {
    return updatePost(id, { 
      status: 'published', 
      published_at: new Date().toISOString() 
    })
  }

  const archivePost = async (id: string) => {
    return updatePost(id, { status: 'archived' })
  }

  const schedulePost = async (id: string, scheduledAt: string) => {
    return updatePost(id, { 
      status: 'scheduled',
      scheduled_at: scheduledAt
    })
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    archivePost,
    schedulePost,
  }
}

