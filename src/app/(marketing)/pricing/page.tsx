'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { useAuth } from "@/lib/hooks/useAuth"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Crown, Check, Settings, User, Mic, LogOut } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense, useState, useRef } from "react"
import { toast } from "sonner"
import { createClient } from '@/lib/supabase/client'

function PricingContent() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, trialUsage, refetch } = useSubscription()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const getUserInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  // Handle payment redirects
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your subscription is now active.')
      // Refresh subscription data multiple times to ensure it's updated
      refetch()
      setTimeout(() => refetch(), 1000)
      setTimeout(() => refetch(), 3000)
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. You can try again anytime.')
    }
  }, [searchParams, refetch, router])

  // Show current subscription status for logged-in users
  useEffect(() => {
    if (user && subscription) {
      console.log('Current subscription status:', subscription)
      if (subscription.subscription_status === 'active') {
        toast.success(`You have an active ${subscription.subscription_plan} subscription!`)
      }
    }
  }, [user, subscription])

  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    // Get the base checkout URL
    let checkoutUrl = plan === 'monthly' 
      ? 'https://narrateai.lemonsqueezy.com/checkout/buy/7e443c6b-7633-481a-a948-9236277bc821'
      : 'https://narrateai.lemonsqueezy.com/checkout/buy/bc477336-bc14-495a-b2c6-53efd148c5fb'
    
    // Add email if user is logged in (this should still work)
    if (user?.email) {
      checkoutUrl += `?checkout[email]=${encodeURIComponent(user.email)}`;
    }
    
    console.log('Redirecting to:', checkoutUrl);
    window.location.href = checkoutUrl;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <div className="h-3 w-3 rounded-full bg-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tight">Narrate AI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How it Works
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Testimonials
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                Pricing
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/recording">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      <Mic className="h-4 w-4" />
                      Record
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-border hover:bg-muted">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="relative" ref={menuRef}>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {getUserInitials(user.user_metadata?.full_name || '', user.email || '')}
                        </span>
                      </div>
                    </Button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                        <div className="p-3 border-b border-border">
                          <p className="text-sm font-medium text-foreground">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start text-left">
                              <User className="h-4 w-4 mr-2" />
                              Dashboard
                            </Button>
                          </Link>
                          <Link href="/settings">
                            <Button variant="ghost" className="w-full justify-start text-left">
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleSignOut}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <Badge className="bg-primary/10 text-primary">Most Popular</Badge>
              </div>
              <CardTitle className="text-2xl font-serif font-bold text-foreground">Pro Monthly</CardTitle>
              <CardDescription className="text-muted-foreground">
                Perfect for getting started
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">$17</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Unlimited voice recordings</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">AI-powered LinkedIn posts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Personalized content based on your goals</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Edit and refine generated posts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Cancel anytime</span>
                </div>
              </div>
              <Button 
                onClick={() => handleUpgrade('monthly')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Monthly Plan
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <Badge className="bg-green-100 text-green-800">Best Value</Badge>
              </div>
              <CardTitle className="text-2xl font-serif font-bold text-foreground">Pro Yearly</CardTitle>
              <CardDescription className="text-muted-foreground">
                Save 2 months with yearly billing
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">$156</span>
                <span className="text-muted-foreground">/year</span>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Save $48 compared to monthly
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Unlimited voice recordings</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">AI-powered LinkedIn posts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Personalized content based on your goals</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Edit and refine generated posts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-foreground">Cancel anytime</span>
                </div>
              </div>
              <Button 
                onClick={() => handleUpgrade('yearly')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Yearly Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Pro Yearly Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
            Why choose Pro Yearly?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Best Value</h3>
              <p className="text-sm text-muted-foreground">
                Save $58 per year compared to monthly billing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">More Features</h3>
              <p className="text-sm text-muted-foreground">
                Advanced analytics, custom templates, and API access
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Team Ready</h3>
              <p className="text-sm text-muted-foreground">
                Collaboration features for growing teams
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-serif font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                What happens if I cancel?
              </h3>
              <p className="text-muted-foreground">
                You'll keep access to all features until the end of your current billing period. No partial refunds.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground">
                Yes! All new accounts get a 7-day free trial with full access to all features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}