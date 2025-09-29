'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Clock, CheckCircle, XCircle } from "lucide-react"
import { UpgradeButton } from "./UpgradeButton"

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
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'trial':
        return <Badge className="bg-yellow-100 text-yellow-800">Trial</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Subscription Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptionStatus === 'active' && subscriptionEndDate && (
          <div className="text-sm text-gray-600 mb-4">
            Next billing: {new Date(subscriptionEndDate).toLocaleDateString()}
          </div>
        )}
        
        {isTrial && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Upgrade to unlock unlimited recordings
            </div>
            <UpgradeButton size="sm" onUpgrade={onUpgrade} />
          </div>
        )}
        
        {subscriptionStatus === 'cancelled' && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Reactivate your subscription to continue
            </div>
            <UpgradeButton size="sm" onUpgrade={onUpgrade} />
          </div>
        )}
        
        {subscriptionStatus === 'expired' && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Your subscription has expired. Renew to continue.
            </div>
            <UpgradeButton size="sm" onUpgrade={onUpgrade} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
