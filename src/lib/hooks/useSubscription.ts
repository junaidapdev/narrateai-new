'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subscription, TrialUsage } from '@/lib/types'

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [trialUsage, setTrialUsage] = useState<TrialUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching subscription:', error)
        return
      }

      if (data) {
        const subscriptionData: Subscription = {
          id: data.id,
          user_id: data.id,
          subscription_status: data.subscription_status || 'trial',
          subscription_id: data.subscription_id,
          trial_minutes_used: data.trial_minutes_used || 0,
          subscription_plan: data.subscription_plan,
          subscription_end_date: data.subscription_end_date,
          created_at: data.created_at,
          updated_at: data.updated_at
        }

        setSubscription(subscriptionData)

        // Calculate trial usage
        const isTrial = subscriptionData.subscription_status === 'trial'
        const minutesLimit = 5
        const canRecord = isTrial ? subscriptionData.trial_minutes_used < minutesLimit : true

        setTrialUsage({
          minutes_used: subscriptionData.trial_minutes_used,
          minutes_limit: minutesLimit,
          is_trial: isTrial,
          can_record: canRecord
        })
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTrialUsage = async (minutesUsed: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ensure the value is a valid number and round to 2 decimal places
      const roundedMinutes = Math.round(minutesUsed * 100) / 100

      const { error } = await supabase
        .from('profiles')
        .update({ 
          trial_minutes_used: roundedMinutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating trial usage:', error)
        console.error('Attempted to update with value:', roundedMinutes)
        return
      }

      // Update local state
      if (subscription) {
        const updatedSubscription = { ...subscription, trial_minutes_used: roundedMinutes }
        setSubscription(updatedSubscription)

        const isTrial = updatedSubscription.subscription_status === 'trial'
        const canRecord = isTrial ? roundedMinutes < 5 : true

        setTrialUsage({
          minutes_used: roundedMinutes,
          minutes_limit: 5,
          is_trial: isTrial,
          can_record: canRecord
        })
      }
    } catch (error) {
      console.error('Error updating trial usage:', error)
    }
  }

  const updateSubscription = async (subscriptionData: Partial<Subscription>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ 
          ...subscriptionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating subscription:', error)
        return
      }

      // Refresh subscription data
      await fetchSubscription()
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  return {
    subscription,
    trialUsage,
    loading,
    updateTrialUsage,
    updateSubscription,
    refetch: fetchSubscription
  }
}