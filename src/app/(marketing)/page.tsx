import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-semibold text-black">
            Narrate
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/signin" className="text-gray-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
          Your best LinkedIn posts are hiding in your morning shower thoughts. 
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Turn rambling voice notes into viral LinkedIn posts. Just talk for 30 seconds. AI does the rest.
        </p>
        <Link href="/signup">
          <Button className="bg-primary hover:bg-primary/90 text-white text-base px-6 py-4 rounded-lg mb-4 transition-all hover:scale-[0.98]">
            Start Talking, Stop Typing →
          </Button>
        </Link>
        <p className="text-sm text-gray-600">
          Join 12,000+ founders who've ditched the blank cursor
        </p>
      </section>

      {/* Problem Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-black mb-8">
          The LinkedIn Content Death Spiral
        </h2>
        <div className="space-y-6 text-gray-600">
          <div>
            <p className="font-semibold text-black">Monday:</p>
            <p>You have a brilliant insight during your morning coffee. "I should post this on LinkedIn."</p>
          </div>
          <div>
            <p className="font-semibold text-black">Tuesday:</p>
            <p>You open LinkedIn, stare at the blank post box, and close it. "I'll write it later."</p>
          </div>
          <div>
            <p className="font-semibold text-black">Wednesday:</p>
            <p>You see someone else post something similar. "They beat me to it." You don't post.</p>
          </div>
          <div>
            <p className="font-semibold text-black">Thursday:</p>
            <p>You try to remember what your insight was. It's gone. You scroll LinkedIn instead.</p>
          </div>
          <div>
            <p className="font-semibold text-black">Friday:</p>
            <p>Another week without posting. Your engagement drops. The cycle continues.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-4">1</div>
            <h3 className="text-xl font-semibold text-black mb-4">Record Your Thoughts</h3>
            <p className="text-gray-600">
              Just talk for 30 seconds. No writing, no typing, no blank cursor paralysis.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-4">2</div>
            <h3 className="text-xl font-semibold text-black mb-4">AI Transcribes & Structures</h3>
            <p className="text-gray-600">
              Our AI turns your rambling into clear, structured content with hooks and CTAs.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-4">3</div>
            <h3 className="text-xl font-semibold text-black mb-4">Post & Engage</h3>
            <p className="text-gray-600">
              Copy, paste, and watch your LinkedIn engagement soar. No more content anxiety.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-200 p-6">
            <p className="text-lg text-black mb-4">
              "I went from posting once a month to 3x per week. My LinkedIn engagement increased 400%. This is the tool I wish I had years ago."
            </p>
            <p className="text-sm text-gray-600">— Sarah Chen, Founder at TechFlow</p>
          </div>
          <div className="border border-gray-200 p-6">
            <p className="text-lg text-black mb-4">
              "Finally, a way to capture my thoughts without losing them. I record while walking my dog and have a post ready in minutes."
            </p>
            <p className="text-sm text-gray-600">— Marcus Rodriguez, CEO at GrowthLab</p>
          </div>
          <div className="border border-gray-200 p-6">
            <p className="text-lg text-black mb-4">
              "The AI actually makes my posts better than when I write them. It adds structure and hooks I never think of."
            </p>
            <p className="text-sm text-gray-600">— Jennifer Park, VP Marketing at DataSync</p>
          </div>
          <div className="border border-gray-200 p-6">
            <p className="text-lg text-black mb-4">
              "I've built my entire personal brand using this tool. 50+ posts in 3 months, all from voice notes."
            </p>
            <p className="text-sm text-gray-600">— David Kim, Startup Advisor</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">🎤 Voice-First Design</h3>
            <p className="text-gray-600">
              Built for people who think better out loud. No more staring at blank screens.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">⚡ Lightning Fast</h3>
            <p className="text-gray-600">
              From voice to viral post in under 2 minutes. No more hours of writing and rewriting.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">🧠 AI That Gets You</h3>
            <p className="text-gray-600">
              Trained on thousands of viral LinkedIn posts to understand what actually works.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">📱 Mobile Optimized</h3>
            <p className="text-gray-600">
              Record on your phone, edit on your laptop. Works wherever your best ideas strike.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">🔒 Your Data, Your Control</h3>
            <p className="text-gray-600">
              Your recordings and content stay private. We never share your ideas or data.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">📈 Engagement Analytics</h3>
            <p className="text-gray-600">
              Track which posts perform best and optimize your content strategy over time.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-black mb-2">Free</h3>
            <div className="text-4xl font-bold text-black mb-6">$0</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                5 recordings per month
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                Basic AI transcription
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                LinkedIn post generation
              </li>
            </ul>
            <Button className="w-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors">
              Get Started Free
            </Button>
          </div>
          <div className="border border-primary p-8">
            <h3 className="text-2xl font-semibold text-black mb-2">Pro</h3>
            <div className="text-4xl font-bold text-black mb-6">$17<span className="text-lg text-gray-600">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                Unlimited voice recordings
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                AI-powered LinkedIn posts
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                Personalized content based on your goals
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                Edit and refine generated posts
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-primary mr-2">✓</span>
                Cancel anytime
              </li>
            </ul>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
              Start Pro Trial
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-black mb-4">
          Every day you don't post, someone else becomes the expert in your space.
        </h2>
        <p className="text-gray-600 mb-8">
          Your next viral post is already in your head. Let's get it out.
        </p>
        <Link href="/signup">
          <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-lg transition-all hover:scale-[0.98]">
            Start Your First Recording
          </Button>
        </Link>
        <div className="mt-8 text-sm text-gray-600">
          <p>Trusted by 12,000+ founders • 99.9% uptime • GDPR compliant</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-semibold text-black mb-4 md:mb-0">
            Narrate
          </div>
          <div className="flex space-x-6 text-sm">
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