'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, FileText, Settings } from 'lucide-react'

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard'
    },
    {
      href: '/recording',
      icon: Mic,
      label: 'Recording'
    },
    {
      href: '/posts',
      icon: FileText,
      label: 'Posts'
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
