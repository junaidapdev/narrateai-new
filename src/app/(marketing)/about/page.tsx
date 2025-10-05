import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Narrate
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About Narrate
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to make content creation accessible to everyone, 
          regardless of their writing skills or time constraints.
        </p>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="mb-6">
              Narrate was born from a simple observation: some of the best content 
              ideas come to us when we're not sitting at a computer. Whether you're 
              walking, driving, or just thinking out loud, your voice contains valuable 
              insights that often get lost.
            </p>
            <p className="mb-6">
              We built Narrate to capture those moments and transform them into 
              engaging content. Our AI-powered platform listens to your voice, 
              understands your ideas, and helps you create compelling posts, articles, 
              and social media content.
            </p>
            <p>
              Today, thousands of creators, entrepreneurs, and professionals use 
              Narrate to turn their thoughts into content that resonates with 
              their audience.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            To democratize content creation by making it as simple as speaking your mind.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Accessibility
              </h3>
              <p className="text-gray-600">
                Everyone has valuable ideas to share. We make it easy for anyone to 
                create professional content, regardless of their writing skills.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Efficiency
              </h3>
              <p className="text-gray-600">
                Turn hours of writing into minutes of speaking. Our AI handles the 
                heavy lifting so you can focus on your ideas.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quality
              </h3>
              <p className="text-gray-600">
                Our advanced AI ensures your content is not just fast to create, 
                but also engaging and well-structured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to join us?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start creating content from your voice today
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600 mb-4 md:mb-0">
            Narrate
          </div>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
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

