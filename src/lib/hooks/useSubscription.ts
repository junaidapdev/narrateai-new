'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Subscription } from '@/lib/types'

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        setError(error.message)
        return
      }

      setSubscription(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...subscriptionData, user_id: user.id }])
        .select()
        .single()

      if (error) {
        throw error
      }

      setSubscription(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateSubscription = async (updates: Partial<Subscription>) => {
    try {
      if (!subscription) {
        throw new Error('No subscription found')
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscription.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setSubscription(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const cancelSubscription = async () => {
    return updateSubscription({ status: 'canceled' })
  }

  const isActive = () => {
    if (!subscription) return false
    return subscription.status === 'active' && 
           new Date(subscription.current_period_end) > new Date()
  }

  const isPro = () => {
    return isActive() && subscription?.plan === 'pro'
  }

  const isEnterprise = () => {
    return isActive() && subscription?.plan === 'enterprise'
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    isActive,
    isPro,
    isEnterprise,
  }
}

