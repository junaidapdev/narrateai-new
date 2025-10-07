'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LinkedInConnection {
  id: string
  linkedin_user_id: string
  linkedin_profile_data: any
  is_active: boolean
  created_at: string
}

export function useLinkedIn() {
  const [connection, setConnection] = useState<LinkedInConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getLinkedInConnection = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('linkedin_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching LinkedIn connection:', error)
      } else if (data) {
        setConnection(data)
      }
      setLoading(false)
    }

    getLinkedInConnection()
  }, [supabase])

  const connectLinkedIn = () => {
    window.location.href = '/api/auth/linkedin/connect'
  }

  const disconnectLinkedIn = async () => {
    if (!connection) return

    const { error } = await supabase
      .from('linkedin_connections')
      .update({ is_active: false })
      .eq('id', connection.id)

    if (error) {
      console.error('Error disconnecting LinkedIn:', error)
    } else {
      setConnection(null)
    }
  }

  return { connection, loading, connectLinkedIn, disconnectLinkedIn }
}
