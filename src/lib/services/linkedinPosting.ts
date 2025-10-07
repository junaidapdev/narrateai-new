import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export interface LinkedInPostData {
  text: string
  visibility: 'PUBLIC' | 'CONNECTIONS'
}

export interface LinkedInPostResponse {
  id: string
  success: boolean
  error?: string
}

export interface LinkedInTokenData {
  access_token: string
  refresh_token?: string
  expires_at?: string
  linkedin_user_id: string
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
}

/**
 * Validates if a LinkedIn access token is still valid
 */
export async function validateToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    return response.ok
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

/**
 * Refreshes a LinkedIn access token using the refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  userId: string
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token refresh failed:', errorData)
      return {
        success: false,
        error: `Token refresh failed: ${response.status} ${response.statusText}`
      }
    }

    const tokenData = await response.json()
    
    if (!tokenData.access_token) {
      return {
        success: false,
        error: 'No access token in refresh response'
      }
    }

    // Update the token in the database
    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('linkedin_connections')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (updateError) {
      console.error('Failed to update token in database:', updateError)
      return {
        success: false,
        error: 'Failed to update token in database'
      }
    }

    return {
      success: true,
      accessToken: tokenData.access_token
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during token refresh'
    }
  }
}

/**
 * Posts content to LinkedIn using the LinkedIn API v2
 */
export async function postToLinkedIn(
  postData: LinkedInPostData,
  userId: string
): Promise<LinkedInPostResponse> {
  try {
    const supabase = await createClient()
    
    // Get LinkedIn connection for the user
    const { data: connection, error: connectionError } = await supabase
      .from('linkedin_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return {
        id: '',
        success: false,
        error: 'LinkedIn connection not found or inactive'
      }
    }

    let accessToken = connection.access_token

    // Validate token first
    const isTokenValid = await validateToken(accessToken)
    
    if (!isTokenValid) {
      console.log('Token invalid, attempting refresh...')
      
      if (!connection.refresh_token) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn token expired and no refresh token available'
        }
      }

      const refreshResult = await refreshAccessToken(connection.refresh_token, userId)
      
      if (!refreshResult.success || !refreshResult.accessToken) {
        return {
          id: '',
          success: false,
          error: refreshResult.error || 'Failed to refresh LinkedIn token'
        }
      }

      accessToken = refreshResult.accessToken
    }

    // Get user's LinkedIn profile to get the person URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!profileResponse.ok) {
      return {
        id: '',
        success: false,
        error: 'Failed to get LinkedIn profile information'
      }
    }

    const profileData = await profileResponse.json()
    const personUrn = `urn:li:person:${profileData.sub}`

    // Create the LinkedIn post using UGC API
    const postPayload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postData.text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility
      }
    }

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postPayload)
    })

    if (!postResponse.ok) {
      const errorData = await postResponse.text()
      console.error('LinkedIn posting failed:', errorData)
      
      // Handle specific LinkedIn API errors
      if (postResponse.status === 401) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn authentication failed. Please reconnect your LinkedIn account.'
        }
      } else if (postResponse.status === 429) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn rate limit exceeded. Please try again later.'
        }
      } else if (postResponse.status === 403) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn posting permission denied. Please check your LinkedIn app permissions.'
        }
      }

      return {
        id: '',
        success: false,
        error: `LinkedIn posting failed: ${postResponse.status} ${postResponse.statusText}`
      }
    }

    const postResult = await postResponse.json()
    
    // Extract the post ID from the response
    const postId = postResult.id || postResult.value?.id || ''

    return {
      id: postId,
      success: true
    }

  } catch (error) {
    console.error('LinkedIn posting error:', error)
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while posting to LinkedIn'
    }
  }
}

/**
 * Gets the LinkedIn profile information for a user
 */
export async function getLinkedInProfile(userId: string): Promise<{
  success: boolean
  profile?: LinkedInProfile
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: connection, error: connectionError } = await supabase
      .from('linkedin_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return {
        success: false,
        error: 'LinkedIn connection not found'
      }
    }

    const isTokenValid = await validateToken(connection.access_token)
    
    if (!isTokenValid) {
      if (!connection.refresh_token) {
        return {
          success: false,
          error: 'LinkedIn token expired and no refresh token available'
        }
      }

      const refreshResult = await refreshAccessToken(connection.refresh_token, userId)
      
      if (!refreshResult.success || !refreshResult.accessToken) {
        return {
          success: false,
          error: refreshResult.error || 'Failed to refresh LinkedIn token'
        }
      }
    }

    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to get LinkedIn profile'
      }
    }

    const profileData = await response.json()

    return {
      success: true,
      profile: {
        id: profileData.sub,
        firstName: profileData.given_name,
        lastName: profileData.family_name,
        profilePicture: profileData.picture
      }
    }

  } catch (error) {
    console.error('Get LinkedIn profile error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Checks if a user has an active LinkedIn connection
 */
export async function hasLinkedInConnection(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('linkedin_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Check LinkedIn connection error:', error)
    return false
  }
}

/**
 * Posts content to LinkedIn using a service role Supabase client (for cron jobs)
 */
export async function postToLinkedInWithServiceRole(
  postData: LinkedInPostData,
  userId: string,
  supabase: SupabaseClient
): Promise<LinkedInPostResponse> {
  try {
    // Get LinkedIn connection for the user using service role client
    const { data: connection, error: connectionError } = await supabase
      .from('linkedin_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return {
        id: '',
        success: false,
        error: 'LinkedIn connection not found or inactive'
      }
    }

    let accessToken = connection.access_token

    // Validate token first
    const isTokenValid = await validateToken(accessToken)
    
    if (!isTokenValid) {
      console.log('Token invalid, attempting refresh...')
      
      if (!connection.refresh_token) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn token expired and no refresh token available'
        }
      }

      const refreshResult = await refreshAccessTokenWithServiceRole(connection.refresh_token, userId, supabase)
      
      if (!refreshResult.success || !refreshResult.accessToken) {
        return {
          id: '',
          success: false,
          error: refreshResult.error || 'Failed to refresh LinkedIn token'
        }
      }

      accessToken = refreshResult.accessToken
    }

    // Get user's LinkedIn profile to get the person URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!profileResponse.ok) {
      return {
        id: '',
        success: false,
        error: 'Failed to get LinkedIn profile information'
      }
    }

    const profileData = await profileResponse.json()
    const personUrn = `urn:li:person:${profileData.sub}`

    // Create the LinkedIn post using UGC API
    const postPayload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postData.text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility
      }
    }

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postPayload)
    })

    if (!postResponse.ok) {
      const errorData = await postResponse.text()
      console.error('LinkedIn posting failed:', errorData)
      
      // Handle specific LinkedIn API errors
      if (postResponse.status === 401) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn authentication failed. Please reconnect your LinkedIn account.'
        }
      } else if (postResponse.status === 429) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn rate limit exceeded. Please try again later.'
        }
      } else if (postResponse.status === 403) {
        return {
          id: '',
          success: false,
          error: 'LinkedIn posting permission denied. Please check your LinkedIn app permissions.'
        }
      }

      return {
        id: '',
        success: false,
        error: `LinkedIn posting failed: ${postResponse.status} ${postResponse.statusText}`
      }
    }

    const postResult = await postResponse.json()
    
    // Extract the post ID from the response
    const postId = postResult.id || postResult.value?.id || ''

    return {
      id: postId,
      success: true
    }

  } catch (error) {
    console.error('LinkedIn posting error:', error)
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while posting to LinkedIn'
    }
  }
}

/**
 * Refreshes a LinkedIn access token using the refresh token with service role client
 */
export async function refreshAccessTokenWithServiceRole(
  refreshToken: string,
  userId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token refresh failed:', errorData)
      return {
        success: false,
        error: `Token refresh failed: ${response.status} ${response.statusText}`
      }
    }

    const tokenData = await response.json()
    
    if (!tokenData.access_token) {
      return {
        success: false,
        error: 'No access token in refresh response'
      }
    }

    // Update the token in the database using service role client
    const { error: updateError } = await supabase
      .from('linkedin_connections')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        token_expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (updateError) {
      console.error('Failed to update token in database:', updateError)
      return {
        success: false,
        error: 'Failed to update token in database'
      }
    }

    return {
      success: true,
      accessToken: tokenData.access_token
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during token refresh'
    }
  }
}
