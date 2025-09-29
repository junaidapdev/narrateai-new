'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRecordings } from "@/lib/hooks/useRecordings"
import { usePosts } from "@/lib/hooks/usePosts"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { formatDate } from "@/lib/utils"
import { Mic, FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { TrialUsageIndicator } from '@/components/subscription/TrialUsageIndicator'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const recentRecordings = recordings.slice(0, 3)
  const recentPosts = posts.slice(0, 3)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-[#0A66C2]">
                Narrate AI
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-[#0A66C2] font-medium">
                  Dashboard
                </Link>
                <Link href="/recording" className="text-gray-600 hover:text-gray-900">
                  Recordings
                </Link>
                <Link href="/posts" className="text-gray-600 hover:text-gray-900">
                  Posts
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Welcome, {user.user_metadata?.full_name || user.email}
              </span>
              <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your content today.
          </p>
        </div>

        {/* Trial Usage Indicator */}
        {trialUsage && trialUsage.is_trial && (
          <TrialUsageIndicator
            minutesUsed={trialUsage.minutes_used}
            minutesLimit={trialUsage.minutes_limit}
            isTrial={trialUsage.is_trial}
            canRecord={trialUsage.can_record}
          />
        )}

        {/* Subscription Status */}
        {subscription && (
          <div className="mb-8">
            <SubscriptionStatus
              subscriptionStatus={subscription.subscription_status}
              subscriptionPlan={subscription.subscription_plan}
              subscriptionEndDate={subscription.subscription_end_date}
              isTrial={trialUsage?.is_trial || false}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recordings.length}</div>
              <p className="text-xs text-muted-foreground">
                {recordings.filter(r => r.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
              <p className="text-xs text-muted-foreground">
                {posts.filter(p => p.status === 'published').length} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recordings.filter(r => r.status === 'processing').length}
              </div>
              <p className="text-xs text-muted-foreground">
                recordings in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recordings.filter(r => {
                  const createdAt = new Date(r.created_at)
                  const now = new Date()
                  return createdAt.getMonth() === now.getMonth() && 
                         createdAt.getFullYear() === now.getFullYear()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                new recordings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Recordings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Recordings</CardTitle>
                <Link href="/recording">
                  <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5">View All</Button>
                </Link>
              </div>
              <CardDescription>
                Your latest voice recordings and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordingsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0A66C2] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading recordings...</p>
                </div>
              ) : recentRecordings.length === 0 ? (
                <div className="text-center py-8">
                  <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No recordings yet</p>
                  <Link href="/recording">
                    <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">Create Your First Recording</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRecordings.map((recording) => (
                    <div key={recording.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(recording.status)}
                        <div>
                          <p className="font-medium">{recording.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(recording.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(recording.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Posts</CardTitle>
                <Link href="/posts">
                  <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5">View All</Button>
                </Link>
              </div>
              <CardDescription>
                Your latest content and publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0A66C2] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading posts...</p>
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No posts yet</p>
                  <Link href="/posts">
                    <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">Create Your First Post</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                      <Badge 
                        className={
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

