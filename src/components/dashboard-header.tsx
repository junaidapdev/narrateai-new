"use client"

import { Button } from "@/components/ui/button"
import { Settings, User, Mic, LogOut, Crown } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'

export function DashboardHeader() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const getUserInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-muted-foreground ${
                pathname === '/dashboard' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/recording"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === '/recording' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              Record
            </Link>
            <Link
              href="/posts"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === '/posts' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              Posts
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === '/pricing' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/recording">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Mic className="h-4 w-4" />
                Record
              </Button>
            </Link>
            
            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-medium">
                  {user ? getUserInitials(user.user_metadata?.full_name || '', user.email || '') : 'U'}
                  {/* Crown icon for Pro members */}
                  {subscription?.subscription_status === 'active' && (
                    <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              </Button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 rounded-lg border border-border/50 bg-card shadow-lg animate-scale-in">
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-medium">
                        {user ? getUserInitials(user.user_metadata?.full_name || '', user.email || '') : 'U'}
                        {/* Crown icon for Pro members in dropdown */}
                        {subscription?.subscription_status === 'active' && (
                          <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {user?.user_metadata?.full_name || 'User'}
                          </p>
                          {subscription?.subscription_status === 'active' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <Link href="/settings">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
