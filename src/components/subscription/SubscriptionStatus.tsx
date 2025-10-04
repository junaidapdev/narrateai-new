'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, CheckCircle, XCircle } from "lucide-react"

interface SubscriptionStatusProps {
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired'
  subscriptionPlan?: 'monthly' | 'yearly'
  subscriptionEndDate?: string
  isTrial: boolean
  onUpgrade?: () => void
}

export function SubscriptionStatus({
  subscriptionStatus,
  subscriptionPlan,
  subscriptionEndDate,
  isTrial,
  onUpgrade
}: SubscriptionStatusProps) {
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
        return `You're subscribed to the ${subscriptionPlan} plan`
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

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg animate-scale-in">
      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground transition-colors group-hover:bg-accent">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Subscription</p>
        <p className="font-serif text-3xl font-medium tracking-tight">
          {subscriptionStatus === 'active' ? subscriptionPlan?.charAt(0).toUpperCase() + subscriptionPlan?.slice(1) : 'Trial'}
        </p>
        <p className="text-xs text-muted-foreground">
          {subscriptionStatus === 'active' 
            ? `Active ${subscriptionPlan} plan`
            : getStatusText()
          }
        </p>
      </div>

      {/* Status Badge */}
      <div className="mt-4">
        {getStatusBadge()}
      </div>

      {/* Action Button */}
      {(isTrial || subscriptionStatus === 'cancelled' || subscriptionStatus === 'expired') && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button 
            size="sm" 
            onClick={onUpgrade}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Upgrade Plan
          </Button>
        </div>
      )}
    </div>
  )
}
