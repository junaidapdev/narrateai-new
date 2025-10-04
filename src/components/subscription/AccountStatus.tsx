'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Crown, CheckCircle, XCircle } from "lucide-react"

interface AccountStatusProps {
  // Trial data
  minutesUsed?: number
  minutesLimit?: number
  isTrial?: boolean
  canRecord?: boolean
  
  // Subscription data
  subscriptionStatus?: 'trial' | 'active' | 'cancelled' | 'expired'
  subscriptionPlan?: 'monthly' | 'yearly'
  subscriptionEndDate?: string
  onUpgrade?: () => void
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

export function AccountStatus({
  minutesUsed = 0,
  minutesLimit = 5,
  isTrial = false,
  canRecord = true,
  subscriptionStatus = 'trial',
  subscriptionPlan,
  subscriptionEndDate,
  onUpgrade
}: AccountStatusProps) {
  const getStatusIcon = () => {
    switch (subscriptionStatus) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'trial':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Crown className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'trial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Trial</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
    }
  }

  const getStatusText = () => {
    switch (subscriptionStatus) {
      case 'active':
        return `Active ${subscriptionPlan} plan`
      case 'trial':
        return 'You\'re currently on a free trial'
      case 'cancelled':
        return 'Your subscription has been cancelled'
      case 'expired':
        return 'Your subscription has expired'
      default:
        return 'Subscription status unknown'
    }
  }

  const trialPercentage = isTrial ? (minutesUsed / minutesLimit) * 100 : 0
  const remainingMinutes = isTrial ? minutesLimit - minutesUsed : 0

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-lg animate-scale-in">
      {/* Mobile Layout: Stacked */}
      <div className="flex flex-col space-y-3 sm:hidden">
        {/* Status Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {subscriptionStatus === 'active' 
                  ? `${subscriptionPlan?.charAt(0).toUpperCase()}${subscriptionPlan?.slice(1)} Plan`
                  : 'Trial Account'
                }
              </span>
              {getStatusBadge()}
            </div>
            {isTrial && (
              <p className="text-xs text-muted-foreground">
                {formatTimeUsage(minutesUsed)}/{minutesLimit} minutes used
              </p>
            )}
          </div>
        </div>

        {/* Trial Progress - Mobile */}
        {isTrial && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(trialPercentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {Math.round(trialPercentage)}%
            </span>
          </div>
        )}

        {/* Action Button - Mobile */}
        {(isTrial || subscriptionStatus === 'cancelled' || subscriptionStatus === 'expired') && (
          <Button 
            size="sm" 
            onClick={onUpgrade}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
          >
            Upgrade
          </Button>
        )}
      </div>

      {/* Desktop Layout: Horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Left: Status Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
            {getStatusIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {subscriptionStatus === 'active' 
                  ? `${subscriptionPlan?.charAt(0).toUpperCase()}${subscriptionPlan?.slice(1)} Plan`
                  : 'Trial Account'
                }
              </span>
              {getStatusBadge()}
            </div>
            {isTrial && (
              <p className="text-xs text-muted-foreground">
                {formatTimeUsage(minutesUsed)}/{minutesLimit} minutes used
              </p>
            )}
          </div>
        </div>

        {/* Center: Trial Progress */}
        {isTrial && (
          <div className="flex items-center gap-3">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(trialPercentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(trialPercentage)}%
            </span>
          </div>
        )}

        {/* Right: Action Button */}
        {(isTrial || subscriptionStatus === 'cancelled' || subscriptionStatus === 'expired') && (
          <Button 
            size="sm" 
            onClick={onUpgrade}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Upgrade
          </Button>
        )}
      </div>
    </div>
  )
}
