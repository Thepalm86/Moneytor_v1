'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LoadingSpinner } from '@/components/layout/loading-spinner'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { LayoutDashboard, CreditCard, PiggyBank, BarChart3, Settings, Tag, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardWrapperProps {
  children: React.ReactNode
  initialUser: User | null
}

export function DashboardWrapper({ children, initialUser }: DashboardWrapperProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser) // Only show loading if no initial user
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If we have an initial user from server-side, we're good to go
    if (initialUser) {
      setUser(initialUser)
      setLoading(false)
      return
    }

    // No initial user - check client-side session (handles login transitions)
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          router.push('/login')
          return
        }

        if (session?.user) {
          setUser(session.user)
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          router.push('/login')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initialUser, router])

  // Loading state - only show if we don't have an initial user
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // No user - redirect is handled in useEffect, show minimal UI
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Navigation items
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: CreditCard,
      current: pathname === '/transactions',
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Tag,
      current: pathname === '/categories',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: pathname === '/analytics',
    },
    {
      name: 'Budgets',
      href: '/budgets',
      icon: PiggyBank,
      current: pathname === '/budgets',
    },
    {
      name: 'Goals',
      href: '/goals',
      icon: Target,
      current: pathname === '/goals',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: pathname === '/settings',
      disabled: true,
    },
  ]

  // User authenticated - render dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">💰 Moneytor</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      Soon
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}