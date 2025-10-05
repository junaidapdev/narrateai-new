'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Target, Users, TrendingUp, ShoppingCart } from "lucide-react"

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

export default function OnboardingGoalPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedGoal, setSelectedGoal] = useState('')
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

  const handleNext = async () => {
    if (!selectedGoal) {
      toast.error('Please select your LinkedIn goal')
      return
    }

    setIsLoading(true)
    try {
      // Save the goal to the database
      const { error } = await supabase
        .from('profiles')
        .update({ linkedin_goal: selectedGoal })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving goal:', error)
        toast.error('Failed to save your goal')
        return
      }

      toast.success('Goal saved!')
      router.push('/onboarding/context')
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
              <span>Step 2 of 3</span>
              <span>Your Goal</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>

          {/* Goal Selection Card */}
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-serif font-bold text-foreground mb-4">
                What's your main LinkedIn goal?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                This helps us personalize your content recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal} className="space-y-4">
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

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/onboarding')}
                  className="flex-1 border-border hover:bg-muted"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!selectedGoal || isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'Saving...' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
