'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Crown, Mic, ArrowRight, Sparkles, Zap, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const { user } = useAuth()
  const { subscription, refetch } = useSubscription()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Refresh subscription data to get latest status
    refetch()
    // Trigger animation
    setIsAnimating(true)
  }, [refetch])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleStartRecording = () => {
    router.push('/recording')
  }

  const planName = subscription?.subscription_plan === 'yearly' ? 'Pro Yearly' : 'Pro Monthly'
  const isYearly = subscription?.subscription_plan === 'yearly'

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
              <span className="font-serif text-xl font-medium tracking-tight">Narrate</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 md:px-8 lg:px-12">
        {/* Success Card */}
        <div className="mx-auto max-w-2xl">
          <Card className="border-border/50 bg-card shadow-lg animate-scale-in">
            <CardHeader className="text-center pb-8">
              {/* Success Icon with Animation */}
              <div className={`mx-auto mb-6 w-20 h-20 bg-green-50 rounded-full flex items-center justify-center transition-all duration-500 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <CardTitle className="text-3xl font-serif font-bold text-foreground mb-2">
                Welcome to Pro! 🎉
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your subscription is now active and you have unlimited access to all features.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Plan Details */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full mb-4">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-foreground">{planName}</span>
                  {isYearly && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Best Value
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlimited recordings • AI content generation • Priority support
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGoToDashboard}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={handleStartRecording}
                  variant="outline"
                  size="lg"
                  className="w-full border-border hover:bg-accent"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Your First Recording
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/50">
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">Unlimited Access</h3>
                  <p className="text-xs text-muted-foreground">Record as much as you want</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">AI-Powered</h3>
                  <p className="text-xs text-muted-foreground">Smart content generation</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">Priority Support</h3>
                  <p className="text-xs text-muted-foreground">Get help when you need it</p>
                </div>
              </div>

              {/* Footer Text */}
              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground">
                  You can manage your subscription anytime in your account settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              What's next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">1. Record Your Thoughts</h3>
                <p className="text-sm text-muted-foreground">
                  Start with a 30-second voice note about your latest insights or experiences.
                </p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">2. AI Transforms Content</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI turns your voice into engaging LinkedIn posts with hooks and calls-to-action.
                </p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">3. Build Your Audience</h3>
                <p className="text-sm text-muted-foreground">
                  Post consistently and watch your LinkedIn engagement grow with every post.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
