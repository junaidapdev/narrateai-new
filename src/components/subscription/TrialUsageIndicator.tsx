'use client'

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertCircle } from "lucide-react"

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
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            Trial Usage
          </span>
        </div>
        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
          {formatTimeUsage(minutesUsed)}/{minutesLimit} minutes
        </Badge>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 mb-2"
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-yellow-700">
          {remainingMinutes > 0 
            ? `${formatTimeUsage(remainingMinutes)} remaining` 
            : 'Trial limit reached'
          }
        </p>
        
        {!canRecord && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs font-medium">Upgrade required</span>
          </div>
        )}
      </div>
    </div>
  )
}
