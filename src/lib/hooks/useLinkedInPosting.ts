'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import { useLinkedIn } from './useLinkedIn'

export interface LinkedInPostData {
  text: string
  visibility?: 'PUBLIC' | 'CONNECTIONS'
}

export interface LinkedInPostResult {
  success: boolean
  linkedinPostId?: string
  error?: string
}

export function useLinkedInPosting() {
  const { user } = useAuth()
  const { connection: linkedinConnection } = useLinkedIn()
  const [isPosting, setIsPosting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const postToLinkedIn = async (postData: LinkedInPostData): Promise<LinkedInPostResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    if (!linkedinConnection) {
      return { success: false, error: 'LinkedIn not connected' }
    }

    setIsPosting(true)

    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: postData.text,
          visibility: postData.visibility || 'PUBLIC'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to post to LinkedIn' }
      }

      return {
        success: true,
        linkedinPostId: data.linkedinPostId
      }
    } catch (error) {
      console.error('LinkedIn posting error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    } finally {
      setIsPosting(false)
    }
  }

  const testConnection = async (): Promise<{ success: boolean; error?: string; profile?: any }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    setIsTesting(true)

    try {
      const response = await fetch('/api/linkedin/test')
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Connection test failed' }
      }

      return {
        success: data.success,
        error: data.error,
        profile: data.profile
      }
    } catch (error) {
      console.error('LinkedIn test error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    } finally {
      setIsTesting(false)
    }
  }

  const canPost = !!user && !!linkedinConnection

  return {
    postToLinkedIn,
    testConnection,
    isPosting,
    isTesting,
    canPost,
    hasLinkedInConnection: !!linkedinConnection
  }
}
