'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Mic, Check, ArrowRight, Star, Users, Zap, Play, Shield, Clock } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif font-medium tracking-tight mb-4">Narrate</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
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
              <span className="font-serif text-xl font-medium tracking-tight">Narrate</span>
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
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered in middle of screen */}
      <section className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-6xl">
            {/* Your voice. <br /> LinkedIn posts. <br /> Zero writing. */}
            {/* The fastest way founders create compelling LinkedIn content. */}
            Turn 5-minute voice notes into scheduled LinkedIn posts. <br />
{/* Zero writing. Maximum impact. */}

              <span className="block text-primary"></span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            The only platform where founders record raw insights and get polished LinkedIn content. Build thought leadership in the time it takes to order coffee.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Mic className="mr-2 h-5 w-5" />
                  Record Your First Post
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No credit card required</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Join 12,000+ founders who've ditched the blank cursor
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              From voice to viral in 2 minutes
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              See how founders turn their shower thoughts into LinkedIn gold
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="bg-muted/50 rounded-2xl p-8">
              <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Mic className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Founder at TechFlow</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="text-muted-foreground italic">
                    "I was thinking about how most startups fail because they don't understand their customers. Like, we build these amazing products but we never actually talk to the people who are supposed to use them..."
                  </p>
                </div>
                <div className="text-sm text-muted-foreground mb-4 text-center">↓ AI Processing ↓</div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="font-medium text-foreground mb-2">The #1 reason startups fail (and how to avoid it)</p>
                  <p className="text-sm text-muted-foreground">
                    After talking to 100+ founders, I've noticed a pattern: most startups fail not because of bad ideas, but because they never actually talk to their customers.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Here's what I learned: The best products come from founders who obsess over customer conversations, not customer acquisition.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    What's your experience? Have you seen this pattern too?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              The LinkedIn content struggle is real
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              You have brilliant insights, but turning them into posts feels impossible
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">The blank cursor paralysis</h3>
                    <p className="text-muted-foreground">You open LinkedIn, stare at the empty post box, and close it. "I'll write it later."</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Someone else posts your idea</h3>
                    <p className="text-muted-foreground">You see a similar post get 500+ likes. "They beat me to it." You don't post.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Your insights disappear</h3>
                    <p className="text-muted-foreground">You try to remember what your brilliant insight was. It's gone. You scroll LinkedIn instead.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Another week without posting</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Your engagement drops</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              What if you could just... talk?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              No writing, no typing, no blank cursor. Just record your thoughts and let AI do the rest.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">1. Record your thoughts</h3>
                <p className="text-muted-foreground">
                  Just talk for 30 seconds. No writing, no typing, no blank cursor paralysis. Capture your insights the moment they happen.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">2. AI transforms your words</h3>
                <p className="text-muted-foreground">
                  Our AI turns your rambling into clear, structured content with hooks, stories, and calls-to-action that actually work.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">3. Post and engage</h3>
                <p className="text-muted-foreground">
                  Copy, paste, and watch your LinkedIn engagement soar. No more content anxiety, just consistent posting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              Join 12,000+ founders who've ditched the blank cursor
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">SC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Founder at TechFlow</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg mb-4">
                  "I went from posting once a month to 3x per week. My LinkedIn engagement increased 400%. This is the tool I wish I had years ago."
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Marcus Rodriguez</p>
                    <p className="text-sm text-muted-foreground">CEO at GrowthLab</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg mb-4">
                  "Finally, a way to capture my thoughts without losing them. I record while walking my dog and have a post ready in minutes."
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">JP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Jennifer Park</p>
                    <p className="text-sm text-muted-foreground">VP Marketing at DataSync</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg mb-4">
                  "The AI actually makes my posts better than when I write them. It adds structure and hooks I never think of."
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-lg">DK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">David Kim</p>
                    <p className="text-sm text-muted-foreground">Startup Advisor</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg mb-4">
                  "I've built my entire personal brand using this tool. 50+ posts in 3 months, all from voice notes."
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              Built for founders who think out loud
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Everything you need to turn your voice into viral content
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Voice-First Design</h3>
                <p className="text-muted-foreground text-sm">
                  Built for people who think better out loud. No more staring at blank screens.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground text-sm">
                  From voice to viral post in under 2 minutes. No more hours of writing.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI That Gets You</h3>
                <p className="text-muted-foreground text-sm">
                  Trained on thousands of viral LinkedIn posts to understand what works.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Mobile Optimized</h3>
                <p className="text-muted-foreground text-sm">
                  Record on your phone, edit on your laptop. Works wherever ideas strike.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Data, Your Control</h3>
                <p className="text-muted-foreground text-sm">
                  Your recordings stay private. We never share your ideas or data.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Engagement Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Track which posts perform best and optimize your content strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
       
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Free Trial</h3>
                <p className="text-muted-foreground mb-6">Perfect for getting started</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">5 recordings per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">AI content generation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">Mobile recording</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">Basic analytics</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>

           
            <div className="bg-white rounded-2xl border-2 border-primary shadow-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Pro</h3>
                <p className="text-muted-foreground mb-6">For serious content creators</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-foreground">$17</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">Unlimited voice recordings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">AI-powered LinkedIn posts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">Personalized content based on your goals</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">Edit and refine generated posts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">Cancel anytime</span>
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Choose Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All plans include 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="bg-muted/50 rounded-3xl p-12">
              <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
                Every day you don't post, someone else becomes the expert in your space
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Your next viral post is already in your head. Let's get it out.
              </p>
              <div className="mt-10">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Mic className="mr-2 h-5 w-5" />
                    Start Your First Recording
                  </Button>
                </Link>
              </div>
              <div className="mt-8 text-sm text-muted-foreground">
                <p>Trusted by 12,000+ founders • 99.9% uptime • GDPR compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <div className="h-3 w-3 rounded-full bg-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tight">Narrate</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/signin" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}