'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRecordings } from "@/lib/hooks/useRecordings"
import { usePosts } from "@/lib/hooks/usePosts"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { AccountStatus } from '@/components/subscription/AccountStatus'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatsGrid } from '@/components/stats-grid'
import { RecentActivity } from '@/components/recent-activity'
import { WelcomeModal } from '@/components/WelcomeModal'
import Link from "next/link"
import { AlertCircle, ArrowRight, X } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { recordings, loading: recordingsLoading } = useRecordings()
  const { posts, loading: postsLoading } = usePosts()
  const { subscription, trialUsage, loading: subscriptionLoading } = useSubscription()
  const router = useRouter()
  const supabase = createClient()
  
  // Onboarding banner state
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  const [showBanner, setShowBanner] = useState(true)
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Fetch onboarding status
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_done')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching onboarding status:', error)
          return
        }

        setOnboardingDone(data?.onboarding_done || false)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchOnboardingStatus()
  }, [user, supabase])

  // Check if user should see welcome modal
  useEffect(() => {
    const checkWelcomeModal = () => {
      // Must have authenticated user (works for email, Google, etc.)
      if (!user || !user.id) return
      
      // Wait for recordings to finish loading
      if (recordingsLoading) return
      
      // Show modal if user has zero recordings and hasn't seen it before
      // Make localStorage key user-specific to avoid conflicts between different Google accounts
      const hasSeenWelcome = localStorage.getItem(`narrate_welcome_seen_${user.id}`)
      const hasRecordings = recordings && recordings.length > 0
      
      // Show modal for any authenticated user (email, Google, etc.) with zero recordings
      if (!hasSeenWelcome && !hasRecordings) {
        setShowWelcomeModal(true)
      }
    }

    checkWelcomeModal()
  }, [user, recordings, recordingsLoading])

  const handleStartRecording = () => {
    router.push('/recording')
  }

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false)
    // Make localStorage key user-specific to avoid conflicts between different Google accounts
    if (user?.id) {
      localStorage.setItem(`narrate_welcome_seen_${user.id}`, 'true')
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to access this page.</p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <DashboardHeader />

      {/* Onboarding Banner */}
      {onboardingDone === false && showBanner && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="mx-auto max-w-7xl px-6 py-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Complete your setup to get personalized content
                  </p>
                  <p className="text-xs text-yellow-700">
                    Tell us about your goals and get better AI-generated posts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push('/onboarding')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Complete Setup
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBanner(false)}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-12">


        {/* Account Status - Only show for trial users */}
        {subscription?.subscription_status === 'trial' && (
          <div className="mb-12">
            <AccountStatus
              minutesUsed={trialUsage?.minutes_used}
              minutesLimit={trialUsage?.minutes_limit}
              isTrial={trialUsage?.is_trial}
              canRecord={trialUsage?.can_record}
              subscriptionStatus={subscription?.subscription_status}
              subscriptionPlan={subscription?.subscription_plan}
              subscriptionEndDate={subscription?.subscription_end_date}
              onUpgrade={() => router.push('/pricing')}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-12">
          <StatsGrid recordings={recordings} posts={posts} />
        </div>

        {/* Recent Activity */}
        <RecentActivity 
          recordings={recordings}
          posts={posts}
          recordingsLoading={recordingsLoading}
          postsLoading={postsLoading}
        />
      </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          onStartRecording={handleStartRecording}
        />
      </div>
    )
  }