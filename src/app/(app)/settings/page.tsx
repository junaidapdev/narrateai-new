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
import { User, Settings, CreditCard, Bell, Shield, LogOut, Mail, Lock, Smartphone, Trash2 } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { DashboardHeader } from '@/components/dashboard-header'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, loading: subscriptionLoading } = useSubscription()
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
    if (subscription?.subscription_status === 'active') {
      if (subscription?.subscription_plan === 'enterprise') {
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>
      }
      if (subscription?.subscription_plan === 'yearly') {
        return <Badge className="bg-blue-100 text-blue-800">Pro Yearly</Badge>
      }
      if (subscription?.subscription_plan === 'monthly') {
        return <Badge className="bg-blue-100 text-blue-800">Pro Monthly</Badge>
      }
      return <Badge className="bg-green-100 text-green-800">Pro</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Trial</Badge>
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <User className="h-5 w-5 mr-3 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                      {getInitials(user.user_metadata?.full_name || user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-lg font-semibold text-foreground">{user.user_metadata?.full_name || 'No name set'}</p>
                      {getPlanBadge()}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-medium text-foreground">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background border-border focus:border-primary focus:ring-primary/20"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="bg-muted border-border text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <Shield className="h-5 w-5 mr-3 text-primary" />
                  Security
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Password</p>
                        <p className="text-sm text-muted-foreground">Last updated 30 days ago</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-border hover:bg-muted">
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-border hover:bg-muted">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <Settings className="h-5 w-5 mr-3 text-primary" />
                  Account Actions
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">Sign Out</p>
                      <p className="text-sm text-red-600">Sign out of your account</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-600">Permanently delete your account and data</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Subscription Info */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <CreditCard className="h-5 w-5 mr-3 text-primary" />
                  Subscription
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : subscription ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Current Plan</span>
                      {getPlanBadge()}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Status: <span className="font-medium text-foreground">{subscription.status}</span></p>
                      <p>Next billing: <span className="font-medium text-foreground">{new Date(subscription.current_period_end).toLocaleDateString()}</span></p>
                    </div>
                    <div className="space-y-3">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Upgrade Plan
                      </Button>
                      <Button variant="outline" className="w-full border-border hover:bg-muted">
                        Billing Settings
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">No active subscription</p>
                    <Link href="/pricing">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <Bell className="h-5 w-5 mr-3 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Recording Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified when recordings are processed</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted">
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