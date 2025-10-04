'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with:', { email, fullName })
    setLoading(true)

    try {
      // Check if Supabase client is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        toast.error('Supabase configuration is missing. Please check your environment variables.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error('Supabase error:', error)
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('User created successfully:', data.user)
        setSuccess(true)
        toast.success('Account created successfully! Please check your email to confirm your account.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold text-foreground">
                Check Your Email
              </h2>
            </div>

            <Card className="bg-background shadow-lg border border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-green-700 text-xl">Check Your Email</CardTitle>
                <CardDescription className="text-muted-foreground">
                  We've sent a confirmation link to {email}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to confirm your account and start using Narrate AI.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-2">
                  <Link href="/signin">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                      Go to Sign In
                    </Button>
                  </Link>
                  <Button 
                    className="w-full border border-border bg-background hover:bg-muted text-foreground font-medium"
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                      setPassword('')
                      setFullName('')
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>

          <Card className="bg-background shadow-lg border border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-xl">Get started with Narrate AI</CardTitle>
              <CardDescription className="text-muted-foreground">
                Start creating content from your voice today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                  disabled={loading}
                  onClick={(e) => {
                    console.log('Button clicked')
                    if (!email || !password || !fullName) {
                      e.preventDefault()
                      toast.error('Please fill in all fields')
                      return
                    }
                  }}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}