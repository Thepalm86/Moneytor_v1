'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LoadingSpinner } from '@/components/layout/loading-spinner'
import { SignOutButton } from '@/components/auth/sign-out-button'
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  BarChart3,
  Settings,
  Tag,
  Target,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardWrapperProps {
  children: React.ReactNode
  initialUser: User | null
}

export function DashboardWrapper({ children, initialUser }: DashboardWrapperProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser) // Only show loading if no initial user
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        router.push('/login')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialUser, router])

  // Loading state - only show if we don't have an initial user
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
      disabled: false,
    },
  ]

  // User authenticated - render dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Mobile menu overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200/50 bg-white/80 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-gray-200/30 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Moneytor</h1>
                <p className="text-xs text-blue-100 opacity-90">Financial Management</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item, index) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    item.current
                      ? 'scale-105 transform bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : item.disabled
                        ? 'cursor-not-allowed text-gray-400 opacity-60'
                        : 'text-gray-700 hover:scale-105 hover:bg-white/50 hover:text-blue-700 hover:shadow-md hover:backdrop-blur-sm'
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  onClick={e => {
                    if (item.disabled) {
                      e.preventDefault()
                    } else {
                      // Close mobile sidebar on navigation
                      setIsSidebarOpen(false)
                    }
                  }}
                >
                  <div
                    className={cn(
                      'mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                      item.current
                        ? 'bg-white/20 shadow-inner'
                        : 'bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.disabled && (
                    <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600 shadow-sm">
                      Soon
                    </span>
                  )}
                  {item.current && (
                    <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-white"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200/30 bg-gray-50/30 px-4 py-4 backdrop-blur-sm">
            <div className="group flex items-center justify-between rounded-xl bg-white/60 p-3 transition-all duration-200 hover:bg-white/80">
              <div className="flex min-w-0 flex-1 items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                  <span className="text-sm font-semibold text-white">
                    {(user.user_metadata?.full_name || user.email?.split('@')[0] || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="ml-2">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-30 lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-xl border border-gray-200/50 bg-white/80 p-3 text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:text-blue-600"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">{children}</div>
      </div>
    </div>
  )
}
