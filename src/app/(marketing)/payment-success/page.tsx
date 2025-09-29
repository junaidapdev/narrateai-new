'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Crown } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const { user } = useAuth()
  const { subscription, refetch } = useSubscription()
  const router = useRouter()

  useEffect(() => {
    // Refresh subscription data to get latest status
    refetch()
  }, [refetch])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-900">
                {subscription?.subscription_plan === 'yearly' ? 'Pro Yearly' : 'Pro Monthly'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              You now have unlimited access to all features!
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleGoToDashboard}
              className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
            >
              Go to Dashboard
            </Button>
            <Link href="/recording">
              <Button variant="outline" className="w-full">
                Start Recording
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              You can manage your subscription anytime in your account settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
