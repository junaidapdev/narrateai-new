'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle } from "lucide-react"

const referralSources = [
  'Twitter',
  'LinkedIn', 
  'Product Hunt',
  'Friend',
  'Google',
  'Other'
]

export default function OnboardingContextPage() {
  const { user, loading: authLoading } = useAuth()
  const [backStory, setBackStory] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  const handleFinish = async () => {
    if (!backStory.trim()) {
      toast.error('Please share your back-story')
      return
    }

    if (!referralSource) {
      toast.error('Please tell us how you heard about Narrate')
      return
    }

    setIsLoading(true)
    try {
      // Save the context and mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({ 
          back_story: backStory.trim(),
          referral_source: referralSource,
          onboarding_done: true
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving context:', error)
        toast.error('Failed to save your information')
        return
      }

      toast.success('Setup complete! Welcome to Narrate!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
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

            {/* Skip Button */}
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step 3 of 3</span>
              <span>Context</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Context Card */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-serif font-bold text-foreground mb-4">
                Share your back-story
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Give us some context about you and your work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="back-story" className="text-foreground font-medium">
                  Tell us about yourself and your work
                </Label>
                <Textarea
                  id="back-story"
                  placeholder="e.g., I'm a startup founder building a SaaS platform for remote teams. I've been in tech for 5 years and love sharing lessons learned..."
                  value={backStory}
                  onChange={(e) => setBackStory(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={600}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>This helps us personalize your content</span>
                  <span>{backStory.length}/600</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral-source" className="text-foreground font-medium">
                  How did you hear about Narrate?
                </Label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger className="border-border">
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

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/onboarding/goal')}
                  className="flex-1 border-border hover:bg-muted"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleFinish}
                  disabled={!backStory.trim() || !referralSource || isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'Finishing...' : 'Finish Setup'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
