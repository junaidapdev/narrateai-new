'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

export function usePostHog() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if PostHog is loaded
    const checkPostHog = () => {
      if (typeof window !== 'undefined' && posthog.__loaded) {
        setIsLoaded(true)
      } else {
        setTimeout(checkPostHog, 100)
      }
    }
    checkPostHog()
  }, [])

  const capture = (event: string, properties?: Record<string, any>) => {
    if (isLoaded) {
      posthog.capture(event, properties)
    } else {
      console.log('PostHog not loaded, event queued:', event, properties)
    }
  }

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (isLoaded) {
      posthog.identify(userId, properties)
    } else {
      console.log('PostHog not loaded, identify queued:', userId, properties)
    }
  }

  const setPersonProperties = (properties: Record<string, any>) => {
    if (isLoaded) {
      posthog.people.set(properties)
    } else {
      console.log('PostHog not loaded, person properties queued:', properties)
    }
  }

  const reset = () => {
    if (isLoaded) {
      posthog.reset()
    }
  }

  const isFeatureEnabled = (flag: string) => {
    if (isLoaded) {
      return posthog.isFeatureEnabled(flag)
    }
    return false
  }

  const getFeatureFlag = (flag: string) => {
    if (isLoaded) {
      return posthog.getFeatureFlag(flag)
    }
    return null
  }

  return {
    isLoaded,
    capture,
    identify,
    setPersonProperties,
    reset,
    isFeatureEnabled,
    getFeatureFlag,
  }
}
