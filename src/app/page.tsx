'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-black mb-4">Narrate AI</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-black">
            Narrate AI
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/signin" className="text-gray-600 hover:text-black transition-colors duration-200">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-[0.98]">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-[1.1] tracking-tight">
            Turn your voice into
            <span className="block text-[#0A66C2]">viral LinkedIn posts</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Stop staring at blank screens. Just talk for 30 seconds. Our AI transforms your thoughts into engaging LinkedIn content that actually gets shared.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup">
              <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg">
                Start Recording Free
              </Button>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Join 12,000+ founders who've ditched the blank cursor
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              From voice to viral in 2 minutes
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              See how founders turn their shower thoughts into LinkedIn gold
            </p>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-[#0A66C2] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-black">Sarah Chen</p>
                  <p className="text-sm text-gray-500">Founder at TechFlow</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-gray-700 italic">
                  "I was thinking about how most startups fail because they don't understand their customers. Like, we build these amazing products but we never actually talk to the people who are supposed to use them..."
                </p>
              </div>
              <div className="text-sm text-gray-500 mb-4">↓ AI Processing ↓</div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-black font-medium mb-2">The #1 reason startups fail (and how to avoid it)</p>
                <p className="text-gray-700 text-sm">
                  After talking to 100+ founders, I've noticed a pattern: most startups fail not because of bad ideas, but because they never actually talk to their customers.
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  Here's what I learned: The best products come from founders who obsess over customer conversations, not customer acquisition.
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  What's your experience? Have you seen this pattern too?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            The LinkedIn content struggle is real
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            You have brilliant insights, but turning them into posts feels impossible
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">The blank cursor paralysis</h3>
                <p className="text-gray-600">You open LinkedIn, stare at the empty post box, and close it. "I'll write it later."</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Someone else posts your idea</h3>
                <p className="text-gray-600">You see a similar post get 500+ likes. "They beat me to it." You don't post.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Your insights disappear</h3>
                <p className="text-gray-600">You try to remember what your brilliant insight was. It's gone. You scroll LinkedIn instead.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Another week without posting</p>
              <p className="text-gray-400 text-xs mt-1">Your engagement drops</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            What if you could just... talk?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No writing, no typing, no blank cursor. Just record your thoughts and let AI do the rest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A66C2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">1. Record your thoughts</h3>
            <p className="text-gray-600">
              Just talk for 30 seconds. No writing, no typing, no blank cursor paralysis. Capture your insights the moment they happen.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A66C2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">2. AI transforms your words</h3>
            <p className="text-gray-600">
              Our AI turns your rambling into clear, structured content with hooks, stories, and calls-to-action that actually work.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A66C2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">3. Post and engage</h3>
            <p className="text-gray-600">
              Copy, paste, and watch your LinkedIn engagement soar. No more content anxiety, just consistent posting.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Join 12,000+ founders who've ditched the blank cursor
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">SC</span>
              </div>
              <div>
                <p className="font-semibold text-black">Sarah Chen</p>
                <p className="text-sm text-gray-500">Founder at TechFlow</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              "I went from posting once a month to 3x per week. My LinkedIn engagement increased 400%. This is the tool I wish I had years ago."
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">MR</span>
              </div>
              <div>
                <p className="font-semibold text-black">Marcus Rodriguez</p>
                <p className="text-sm text-gray-500">CEO at GrowthLab</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              "Finally, a way to capture my thoughts without losing them. I record while walking my dog and have a post ready in minutes."
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">JP</span>
              </div>
              <div>
                <p className="font-semibold text-black">Jennifer Park</p>
                <p className="text-sm text-gray-500">VP Marketing at DataSync</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              "The AI actually makes my posts better than when I write them. It adds structure and hooks I never think of."
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">DK</span>
              </div>
              <div>
                <p className="font-semibold text-black">David Kim</p>
                <p className="text-sm text-gray-500">Startup Advisor</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg mb-4">
              "I've built my entire personal brand using this tool. 50+ posts in 3 months, all from voice notes."
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Built for founders who think out loud
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to turn your voice into viral content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Voice-First Design</h3>
            <p className="text-gray-600 text-sm">
              Built for people who think better out loud. No more staring at blank screens.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              From voice to viral post in under 2 minutes. No more hours of writing.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">AI That Gets You</h3>
            <p className="text-gray-600 text-sm">
              Trained on thousands of viral LinkedIn posts to understand what works.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Mobile Optimized</h3>
            <p className="text-gray-600 text-sm">
              Record on your phone, edit on your laptop. Works wherever ideas strike.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Your Data, Your Control</h3>
            <p className="text-gray-600 text-sm">
              Your recordings stay private. We never share your ideas or data.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Engagement Analytics</h3>
            <p className="text-gray-600 text-sm">
              Track which posts perform best and optimize your content strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">Free</h3>
              <div className="text-4xl font-bold text-black mb-2">$0</div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-[#0A66C2] mr-3">✓</span>
                <span className="text-gray-700">5 recordings per month</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#0A66C2] mr-3">✓</span>
                <span className="text-gray-700">Basic AI transcription</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#0A66C2] mr-3">✓</span>
                <span className="text-gray-700">LinkedIn post generation</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#0A66C2] mr-3">✓</span>
                <span className="text-gray-700">Mobile app access</span>
              </li>
            </ul>
            <Button className="w-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors py-3">
              Get Started Free
            </Button>
          </div>

          <div className="bg-[#0A66C2] text-white rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#0A66C2] text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-2">$29<span className="text-lg opacity-80">/month</span></div>
              <p className="opacity-80">For serious content creators</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                <span>Unlimited recordings</span>
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                <span>Advanced AI with custom prompts</span>
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                <span>Multiple platform support</span>
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                <span>Priority processing</span>
          </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                <span>Analytics dashboard</span>
          </li>
            </ul>
            <Button className="w-full bg-white text-[#0A66C2] hover:bg-gray-100 transition-colors py-3">
              Start Pro Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="bg-gray-50 rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Every day you don't post, someone else becomes the expert in your space
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your next viral post is already in your head. Let's get it out.
          </p>
          <Link href="/signup">
            <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg">
              Start Your First Recording
            </Button>
          </Link>
          <div className="mt-8 text-sm text-gray-500">
            <p>Trusted by 12,000+ founders • 99.9% uptime • GDPR compliant</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-semibold text-black mb-4 md:mb-0">
            Narrate AI
          </div>
          <div className="flex space-x-8 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-black transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/signin" className="text-gray-600 hover:text-black transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}