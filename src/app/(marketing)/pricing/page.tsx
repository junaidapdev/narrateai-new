'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { useAuth } from "@/lib/hooks/useAuth"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Crown, Check } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { toast } from "sonner"

function PricingContent() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, trialUsage, refetch } = useSubscription()
  const searchParams = useSearchParams()
  const router = useRouter()

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
    // Redirect to Lemon Squeezy checkout
    const checkoutUrl = plan === 'monthly' 
      ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_URL || 'https://narrateai.lemonsqueezy.com/buy/7e443c6b-7633-481a-a948-9236277bc821'
      : process.env.NEXT_PUBLIC_LEMONSQUEEZY_YEARLY_URL || 'https://narrateai.lemonsqueezy.com/buy/bc477336-bc14-495a-b2c6-53efd148c5fb'
    
    window.open(checkoutUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Narrate AI
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {user ? 'Upgrade Your Plan' : 'Simple, transparent pricing'}
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          {user 
            ? 'Choose the plan that\'s right for you. Upgrade or downgrade at any time.'
            : 'Choose the plan that\'s right for you. Upgrade or downgrade at any time.'
          }
        </p>
        
        {/* Trial Usage Indicator for logged-in users */}
        {user && trialUsage && trialUsage.is_trial && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Current Trial Usage
              </span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800 mb-1">
                {trialUsage.minutes_used.toFixed(1)}/{trialUsage.minutes_limit} minutes
              </div>
              <p className="text-sm text-yellow-700">
                {trialUsage.minutes_limit - trialUsage.minutes_used > 0 
                  ? `${(trialUsage.minutes_limit - trialUsage.minutes_used).toFixed(1)} minutes remaining`
                  : 'Trial limit reached - upgrade to continue'
                }
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="border-indigo-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Crown className="h-6 w-6 text-indigo-600" />
                <span>Pro Monthly</span>
              </CardTitle>
              <div className="text-4xl font-bold text-gray-900">
                $29<span className="text-lg text-gray-500">/month</span>
              </div>
              <CardDescription>
                Best for content creators and professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited recordings
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  AI-powered transcription
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Content generation
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Export options
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleUpgrade('monthly')}
              >
                <Crown className="h-4 w-4 mr-2" />
                {user ? 'Upgrade to Monthly' : 'Start Free Trial'}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="border-green-500 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-500 text-white">Save 17%</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Crown className="h-6 w-6 text-green-600" />
                <span>Pro Yearly</span>
              </CardTitle>
              <div className="text-4xl font-bold text-gray-900">
                $290<span className="text-lg text-gray-500">/year</span>
              </div>
              <CardDescription>
                Best value - save $58 compared to monthly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Everything in Monthly
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Custom integrations
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Dedicated support
                </li>
              </ul>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleUpgrade('yearly')}
              >
                <Crown className="h-4 w-4 mr-2" />
                {user ? 'Upgrade to Yearly' : 'Start Free Trial'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Can I change my plan at any time?
            </h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              What happens to my data if I cancel?
            </h3>
            <p className="text-gray-600">
              Your data is always yours. You can export your recordings and posts before canceling.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600">
              Yes! All paid plans come with a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600 mb-4 md:mb-0">
            Narrate AI
          </div>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/signin" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}

