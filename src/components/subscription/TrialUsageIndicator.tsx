'use client'

import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"

interface TrialUsageIndicatorProps {
  minutesUsed: number
  minutesLimit: number
  isTrial: boolean
  canRecord: boolean
}

// Helper function to format time with minutes and seconds
const formatTimeUsage = (minutes: number) => {
  const wholeMinutes = Math.floor(minutes)
  const seconds = Math.round((minutes - wholeMinutes) * 60)
  
  if (wholeMinutes === 0 && seconds === 0) {
    return '0 seconds'
  } else if (wholeMinutes === 0) {
    return `${seconds} seconds`
  } else if (seconds === 0) {
    return `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''}`
  } else {
    return `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''} ${seconds} seconds`
  }
}

export function TrialUsageIndicator({ 
  minutesUsed, 
  minutesLimit, 
  isTrial, 
  canRecord 
}: TrialUsageIndicatorProps) {
  if (!isTrial) return null

  const percentage = (minutesUsed / minutesLimit) * 100
  const remainingMinutes = minutesLimit - minutesUsed

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg animate-scale-in">
      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground transition-colors group-hover:bg-accent">
        <Clock className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Trial Usage</p>
        <p className="font-serif text-3xl font-medium tracking-tight">{formatTimeUsage(minutesUsed)}</p>
        <p className="text-xs text-muted-foreground">of {minutesLimit} minutes</p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{remainingMinutes > 0 ? `${formatTimeUsage(remainingMinutes)} remaining` : 'Trial limit reached'}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
