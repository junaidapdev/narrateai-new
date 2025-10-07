'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { useLinkedIn } from "@/lib/hooks/useLinkedIn"
import { getInitials } from "@/lib/utils"
import { User, Settings, CreditCard, LogOut, Mail, Trash2, Target, Users, TrendingUp, ShoppingCart, Sparkles, Linkedin, CheckCircle, XCircle } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { DashboardHeader } from '@/components/dashboard-header'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, loading: subscriptionLoading } = useSubscription()
  const { connection: linkedinConnection, loading: linkedinLoading, connectLinkedIn, disconnectLinkedIn } = useLinkedIn()
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isUpdating, setIsUpdating] = useState(false)
  
  // LinkedIn OAuth result handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const linkedinSuccess = urlParams.get('linkedin_success')
    const linkedinError = urlParams.get('linkedin_error')
    
    if (linkedinSuccess === 'connected') {
      toast.success('LinkedIn connected successfully!')
      // Clean up URL
      window.history.replaceState({}, '', '/settings')
    } else if (linkedinError) {
      const errorMessages: Record<string, string> = {
        'access_denied': 'LinkedIn connection was cancelled',
        'missing_parameters': 'Missing authorization parameters',
        'token_failed': 'Failed to get LinkedIn access token',
        'profile_failed': 'Failed to get LinkedIn profile',
        'storage_failed': 'Failed to save LinkedIn connection',
        'callback_failed': 'LinkedIn connection failed'
      }
      toast.error(errorMessages[linkedinError] || 'LinkedIn connection failed')
      // Clean up URL
      window.history.replaceState({}, '', '/settings')
    }
  }, [])
  
  // Onboarding fields state
  const [linkedinGoal, setLinkedinGoal] = useState('')
  const [backStory, setBackStory] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  // Goals for LinkedIn
  const goals = [
    {
      id: 'brand',
      label: 'Build my personal brand',
      description: 'Establish thought leadership and grow my following',
      icon: Target
    },
    {
      id: 'hire',
      label: 'Hire top talent',
      description: 'Attract and recruit the best people for my team',
      icon: Users
    },
    {
      id: 'raise',
      label: 'Raise capital',
      description: 'Connect with investors and secure funding',
      icon: TrendingUp
    },
    {
      id: 'sell',
      label: 'Sell my product/service',
      description: 'Generate leads and drive sales',
      icon: ShoppingCart
    }
  ]

  const referralSources = [
    'Twitter',
    'LinkedIn', 
    'Product Hunt',
    'Friend',
    'Google',
    'Other'
  ]

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('linkedin_goal, back_story, referral_source')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        setLinkedinGoal(data?.linkedin_goal || '')
        setBackStory(data?.back_story || '')
        setReferralSource(data?.referral_source || '')
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

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
    if (!user) return
    
    setIsUpdating(true)
    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (authError) {
        console.error('Error updating user metadata:', authError)
        toast.error('Failed to update profile')
        return
      }

      // Try to update the profiles table, but don't fail if it doesn't work
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', user.id)

        if (profileError) {
          console.warn('Could not update profiles table:', profileError)
          // Continue anyway since auth update succeeded
        }
      } catch (profileUpdateError) {
        console.warn('Profiles table update failed:', profileUpdateError)
        // Continue anyway since auth update succeeded
      }

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateOnboarding = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          linkedin_goal: linkedinGoal,
          back_story: backStory,
          referral_source: referralSource
        })
        .eq('id', user?.id)

      if (error) {
        console.error('Error updating onboarding:', error)
        toast.error('Failed to update personalization settings')
        return
      }

      toast.success('Personalization settings updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsUpdating(false)
    }
  }

  const getPlanBadge = () => {
    if (!subscription) {
      return <Badge className="bg-gray-100 text-gray-800">No Plan</Badge>
    }
    
    if (subscription.subscription_status === 'active') {
      if (subscription.subscription_plan === 'yearly') {
        return <Badge className="bg-blue-100 text-blue-800">Pro Yearly</Badge>
      }
      if (subscription.subscription_plan === 'monthly') {
        return <Badge className="bg-blue-100 text-blue-800">Pro Monthly</Badge>
      }
      return <Badge className="bg-green-100 text-green-800">Pro</Badge>
    }
    
    if (subscription.subscription_status === 'trial') {
      return <Badge className="bg-yellow-100 text-yellow-800">Trial</Badge>
    }
    
    if (subscription.subscription_status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
    }
    
    if (subscription.subscription_status === 'expired') {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>
    }
    
    return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
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
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info Display */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.user_metadata?.full_name || user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {user.user_metadata?.full_name || 'No name set'}
                      </p>
                      {getPlanBadge()}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Name Update */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-medium text-foreground">
                      Display Name
                    </Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background border-border focus:border-primary focus:ring-primary/20"
                      placeholder="Enter your display name"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how your name appears in the app
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating || fullName === (user.user_metadata?.full_name || '')} 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personalization Settings */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <Sparkles className="h-5 w-5 mr-3 text-primary" />
                  Personalization Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Help us personalize your content by sharing your goals and background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingProfile ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <>
                    {/* LinkedIn Goal */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-foreground">What's your main LinkedIn goal?</Label>
                      <RadioGroup value={linkedinGoal} onValueChange={setLinkedinGoal} className="space-y-3">
                        {goals.map((goal) => {
                          const IconComponent = goal.icon
                          return (
                            <div key={goal.id} className="relative">
                              <RadioGroupItem 
                                value={goal.id} 
                                id={goal.id}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={goal.id}
                                className="flex items-center gap-4 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                              >
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{goal.label}</p>
                                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                                </div>
                              </Label>
                            </div>
                          )
                        })}
                      </RadioGroup>
                    </div>

                    {/* Back Story */}
                    <div className="space-y-2">
                      <Label htmlFor="back-story" className="text-sm font-medium text-foreground">
                        Tell us about yourself and your work
                      </Label>
                      <Textarea
                        id="back-story"
                        placeholder="e.g., I'm a startup founder building a SaaS platform for remote teams. I've been in tech for 5 years and love sharing lessons learned..."
                        value={backStory}
                        onChange={(e) => setBackStory(e.target.value)}
                        className="min-h-[120px] resize-none bg-background border-border focus:border-primary focus:ring-primary/20"
                        maxLength={600}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>This helps us personalize your content</span>
                        <span>{backStory.length}/600</span>
                      </div>
                    </div>

                    {/* Referral Source */}
                    <div className="space-y-2">
                      <Label htmlFor="referral-source" className="text-sm font-medium text-foreground">
                        How did you hear about Narrate?
                      </Label>
                      <Select value={referralSource} onValueChange={setReferralSource}>
                        <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary/20">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {referralSources.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleUpdateOnboarding} 
                        disabled={isUpdating} 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isUpdating ? 'Updating...' : 'Update Personalization'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* LinkedIn Integration */}
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-serif font-semibold text-foreground">
                  <Linkedin className="h-5 w-5 mr-3 text-primary" />
                  LinkedIn Integration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Connect your LinkedIn account to schedule posts directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkedinLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : linkedinConnection ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">LinkedIn Connected</p>
                            <p className="text-sm text-green-600">
                              Connected as {linkedinConnection.linkedin_profile_data?.given_name} {linkedinConnection.linkedin_profile_data?.family_name}
                            </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>✅ You can now schedule posts directly to LinkedIn</p>
                      <p>✅ Posts will be published automatically at your chosen time</p>
                      <p>✅ Manage all your scheduled posts from the dashboard</p>
                    </div>
                    <Button 
                      onClick={disconnectLinkedIn}
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Disconnect LinkedIn
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">LinkedIn Not Connected</p>
                        <p className="text-sm text-gray-600">Connect to schedule posts directly to LinkedIn</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>🔗 Connect your LinkedIn account to unlock:</p>
                      <p>• Schedule posts directly from Narrate</p>
                      <p>• Automatic posting at your chosen time</p>
                      <p>• Seamless content workflow</p>
                    </div>
                    <Button 
                      onClick={connectLinkedIn}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </Button>
                  </div>
                )}
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
                      <p>Status: <span className="font-medium text-foreground capitalize">{subscription.subscription_status}</span></p>
                      {subscription.subscription_end_date && (
                        <p>Next billing: <span className="font-medium text-foreground">{new Date(subscription.subscription_end_date).toLocaleDateString()}</span></p>
                      )}
                      {subscription.subscription_plan && (
                        <p>Plan: <span className="font-medium text-foreground capitalize">{subscription.subscription_plan}</span></p>
                      )}
                    </div>
                    <div className="space-y-3">
                      {subscription.subscription_status === 'trial' ? (
                        <Button 
                          onClick={() => router.push('/pricing')}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Upgrade to Pro
                        </Button>
                      ) : subscription.subscription_status === 'active' ? (
                        <Button 
                          onClick={() => router.push('/pricing')}
                          variant="outline" 
                          className="w-full border-border hover:bg-muted"
                        >
                          Manage Subscription
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => router.push('/pricing')}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Reactivate Subscription
                        </Button>
                      )}
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

          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}