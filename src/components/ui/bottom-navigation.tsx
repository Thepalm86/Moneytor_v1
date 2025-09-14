'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BottomNavigationItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number | string
  current?: boolean
}

interface BottomNavigationProps {
  items: BottomNavigationItem[]
  className?: string
}

export function BottomNavigation({ items, className }: BottomNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        // Fixed positioning at bottom with mobile-first design
        'fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl',
        // Safe area support for mobile devices with home indicator
        'pb-safe-area-inset-bottom',
        // Shadow and visual enhancement
        'shadow-2xl shadow-gray-900/10',
        className
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-md">
        <div className="flex h-16 items-center justify-around px-2">
          {items.map((item) => {
            const isActive = pathname === item.href || item.current
            const IconComponent = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                aria-label={item.name}
                className={cn(
                  // Touch-optimized button with minimum 44px touch target
                  'relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl px-2 py-1.5 transition-all duration-200 ease-in-out',
                  // Touch feedback and active states
                  'touch-manipulation select-none active:scale-95',
                  // Color and state management
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100',
                  // Focus states for accessibility
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-white'
                )}
              >
                {/* Icon container with active state indicator */}
                <div className="relative">
                  <IconComponent
                    className={cn(
                      'h-6 w-6 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-current'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge notification */}
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                    >
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'mt-1 text-xs font-medium leading-none transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-current'
                  )}
                >
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-8 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// Hook for managing bottom navigation visibility
export function useBottomNavigation() {
  const [isVisible, setIsVisible] = React.useState(true)
  const [lastScrollY, setLastScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return { isVisible, setIsVisible }
}

export type { BottomNavigationItem }