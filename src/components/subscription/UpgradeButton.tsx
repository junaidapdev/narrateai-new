'use client'

import { Button } from "@/components/ui/button"
import { Crown, Zap } from "lucide-react"

interface UpgradeButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onUpgrade?: () => void
}

export function UpgradeButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  onUpgrade 
}: UpgradeButtonProps) {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      // Default behavior - redirect to pricing page
      window.location.href = '/pricing'
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white ${className}`}
      onClick={handleUpgrade}
    >
      <Crown className="h-4 w-4 mr-2" />
      Upgrade
    </Button>
  )
}
