'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap } from "lucide-react"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (plan: 'monthly' | 'yearly') => void
}

export function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    // Redirect to pricing page
    window.location.href = '/pricing'
    onUpgrade(plan)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-[#0A66C2]" />
            <span>Upgrade to Continue Recording</span>
          </DialogTitle>
          <DialogDescription>
            You've used all 5 minutes of your free trial. Choose a plan to continue creating amazing content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Monthly Plan */}
          <Card className="border-2 border-gray-200 hover:border-[#0A66C2] transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Monthly</CardTitle>
                <Badge className="bg-[#0A66C2] text-white">Popular</Badge>
              </div>
              <div className="text-3xl font-bold text-[#0A66C2]">$17<span className="text-lg text-gray-500">/month</span></div>
              <CardDescription>
                Perfect for regular content creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited voice recordings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI-powered LinkedIn posts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Personalized content based on your goals</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Edit and refine generated posts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cancel anytime</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90"
                onClick={() => handleUpgrade('monthly')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Monthly Plan
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="border-2 border-[#0A66C2] relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-[#0A66C2] text-white">Best Value</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Yearly</CardTitle>
              <div className="text-3xl font-bold text-[#0A66C2]">$156<span className="text-lg text-gray-500">/year</span></div>
              <CardDescription>
                Save 24% with annual billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited voice recordings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI-powered LinkedIn posts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Personalized content based on your goals</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Edit and refine generated posts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cancel anytime</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90"
                onClick={() => handleUpgrade('yearly')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Start Yearly Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            All plans include a 30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
