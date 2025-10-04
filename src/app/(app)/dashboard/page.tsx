'use client'

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
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { recordings, loading: recordingsLoading } = useRecordings()
  const { posts, loading: postsLoading } = usePosts()
  const { subscription, trialUsage, loading: subscriptionLoading } = useSubscription()
  const router = useRouter()
  const supabase = createClient()

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

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-12">

        {/* Account Status */}
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
    </div>
  )
}