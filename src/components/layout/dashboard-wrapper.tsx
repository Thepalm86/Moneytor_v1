'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { PageLoadingSpinner } from '@/components/layout/loading-spinner'
import { GamificationProvider } from '@/contexts/gamification-context'
import { DashboardCelebrations } from '@/components/layout/dashboard-celebrations'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Plus,
  Zap,
  User,
  LogOut,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigationThemeColors } from '@/lib/utils/page-themes'
import { BottomNavigation, type BottomNavigationItem } from '@/components/ui/bottom-navigation'
import { SpeedDialFAB, type SpeedDialAction } from '@/components/ui/floating-action-button'

interface DashboardWrapperProps {
  children: React.ReactNode
  initialUser: User | null
}

export function DashboardWrapper({ children, initialUser }: DashboardWrapperProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser) // Only show loading if no initial user
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

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

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign out failed',
          description: error.message,
        })
        return
      }

      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of your account.',
      })

      router.push('/login')
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again later.',
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  // Loading state - only show if we don't have an initial user
  if (loading) {
    return <PageLoadingSpinner type="dashboard" useProgressive />
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

  // Mobile bottom navigation items (core features only)
  const mobileNavigation: BottomNavigationItem[] = [
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
      name: 'Analytics', 
      href: '/analytics',
      icon: BarChart3,
      current: pathname === '/analytics',
    },
    {
      name: 'More',
      href: '/settings',
      icon: Menu,
      current: ['/budgets', '/goals', '/categories', '/settings'].includes(pathname),
    },
  ]

  // Speed dial actions for FAB
  const speedDialActions: SpeedDialAction[] = [
    {
      icon: CreditCard,
      label: 'Add Transaction',
      onClick: () => router.push('/transactions?action=add'),
    },
    {
      icon: PiggyBank,
      label: 'Create Budget',
      onClick: () => router.push('/budgets?action=create'),
    },
    {
      icon: Target,
      label: 'Set Goal',
      onClick: () => router.push('/goals?action=create'),
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
          <div className="flex items-center justify-between border-b border-gray-200/30 bg-gradient-to-br from-emerald-600 via-blue-600 to-indigo-700 px-6 py-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
            <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/5 blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-white/5 blur-lg"></div>
            
            <div className="flex items-center relative z-10">
              <div className="mr-4 relative">
                {/* Enhanced icon container with premium styling */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/25 to-white/10 border border-white/20 shadow-xl backdrop-blur-sm">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"></div>
                  <span className="text-2xl relative z-10 drop-shadow-sm">💰</span>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-2 rounded-xl bg-white/20 blur-md opacity-50"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                  Moneytor
                </h1>
                <p className="text-xs text-emerald-100/90 font-medium tracking-wide uppercase">
                  Financial Intelligence
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-xl p-2.5 text-white/80 transition-all duration-200 hover:bg-white/15 hover:text-white hover:scale-105 lg:hidden relative z-10 border border-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-4 overflow-y-auto min-h-0">
            {navigation.map((item, index) => {
              const IconComponent = item.icon
              const pageTheme =
                navigationThemeColors[item.href as keyof typeof navigationThemeColors] ||
                navigationThemeColors['/dashboard']

              return (
                <Link
                  key={item.name}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'group relative flex items-center overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    item.current
                      ? `scale-105 transform bg-gradient-to-r ${pageTheme.gradient} text-white shadow-2xl ${pageTheme.shadowColor} border border-white/10`
                      : item.disabled
                        ? 'cursor-not-allowed text-gray-400 opacity-50'
                        : 'border border-transparent text-gray-700 hover:scale-[1.02] hover:border-white/20 hover:bg-gradient-to-r hover:from-white/60 hover:to-white/40 hover:text-gray-800 hover:shadow-lg hover:backdrop-blur-sm'
                  )}
                  style={{
                    animationDelay: `${index * 75}ms`,
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
                  {/* Background glow for active item */}
                  {item.current && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-sm"></div>
                  )}

                  <div
                    className={cn(
                      'relative mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                      item.current
                        ? 'border border-white/30 bg-white/25 shadow-lg shadow-black/20 backdrop-blur-sm'
                        : 'border border-gray-200/50 bg-gray-100 group-hover:border-white/40 group-hover:bg-white/80 group-hover:shadow-md'
                    )}
                  >
                    <IconComponent
                      className={cn(
                        'h-5 w-5 transition-colors duration-300',
                        item.current ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                      )}
                    />
                  </div>

                  <span className="relative flex-1 truncate font-medium">{item.name}</span>

                  {item.disabled && (
                    <span className="relative ml-auto rounded-full bg-gray-200/80 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm">
                      Soon
                    </span>
                  )}

                  {item.current && (
                    <div className="relative ml-auto flex items-center space-x-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white/90 shadow-sm"></div>
                      <div
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60"
                        style={{ animationDelay: '0.5s' }}
                      ></div>
                    </div>
                  )}

                  {/* Hover indicator */}
                  {!item.current && !item.disabled && (
                    <div className="absolute right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section with dropdown menu - sticky positioning for better mobile experience */}
          <div className="sticky bottom-0 mt-auto border-t border-gray-200/30 bg-gradient-to-b from-gray-50/40 to-gray-50/60 px-4 py-4 backdrop-blur-md">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-white/70 to-white/50 p-4 transition-all duration-300 hover:from-white/90 hover:to-white/70 hover:shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <div className="flex min-w-0 flex-1 items-center">
                    <div className="mr-3 relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600 shadow-lg border border-white/20">
                        <span className="text-sm font-bold text-white drop-shadow-sm">
                          {(user.user_metadata?.full_name || user.email?.split('@')[0] || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      {/* Subtle glow effect */}
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-400/20 blur-sm opacity-60"></div>
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="truncate text-xs text-gray-600 font-medium">{user.email}</p>
                    </div>
                  </div>
                  <ChevronDown className="ml-3 h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 mb-2 mr-4"
                side="top"
              >
                <DropdownMenuLabel className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600">
                      <span className="text-xs font-bold text-white">
                        {(user.user_metadata?.full_name || user.email?.split('@')[0] || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile & Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <GamificationProvider>
          <div className="p-4 pt-20 pb-24 lg:p-8 lg:pt-8 lg:pb-8">{children}</div>
          <DashboardCelebrations />
        </GamificationProvider>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNavigation items={mobileNavigation} />
      </div>

      {/* Floating Action Button (Speed Dial) */}
      <div className="lg:hidden">
        <SpeedDialFAB actions={speedDialActions} />
      </div>
    </div>
  )
}
