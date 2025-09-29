'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { getInitials } from "@/lib/utils"
import { User, Settings, CreditCard, Bell, Shield } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, loading: subscriptionLoading, isPro, isEnterprise } = useSubscription()
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isUpdating, setIsUpdating] = useState(false)
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

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      // In a real app, you would update the user profile in Supabase
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const getPlanBadge = () => {
    if (isEnterprise()) {
      return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
    }
    if (isPro()) {
      return <Badge className="bg-blue-100 text-blue-800">Pro</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Free</Badge>
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
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/recording" className="text-gray-600 hover:text-gray-900">
                  Recordings
                </Link>
                <Link href="/posts" className="text-gray-600 hover:text-gray-900">
                  Posts
                </Link>
                <Link href="/settings" className="text-[#0A66C2] font-medium">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.user_metadata?.full_name || user.email}
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
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {getInitials(user.user_metadata?.full_name || user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.user_metadata?.full_name || 'No name set'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {getPlanBadge()}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} disabled={isUpdating} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-600">Last updated 30 days ago</p>
                  </div>
                  <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5">
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription
                </CardTitle>
                <CardDescription>
                  Manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0A66C2] mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading...</p>
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Plan</span>
                      {getPlanBadge()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Status: {subscription.status}</p>
                      <p>Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
                        Upgrade Plan
                      </Button>
                      <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                        Billing Settings
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-4">No active subscription</p>
                    <Link href="/pricing">
                      <Button className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recording Updates</p>
                    <p className="text-sm text-gray-600">Get notified when recordings are processed</p>
                  </div>
                  <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

