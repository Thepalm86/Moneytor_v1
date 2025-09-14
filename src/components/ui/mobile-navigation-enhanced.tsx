'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSwipeGesture } from './mobile-gestures'
import { Button } from './button'

// Enhanced navigation header with swipe-to-go-back
interface MobileNavigationHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  rightAction?: React.ReactNode
  onBack?: () => void
  enableSwipeBack?: boolean
  className?: string
  transparent?: boolean
}

export function MobileNavigationHeader({
  title,
  subtitle,
  showBackButton = true,
  rightAction,
  onBack,
  enableSwipeBack = true,
  className,
  transparent = false,
}: MobileNavigationHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const swipeHandlers = useSwipeGesture({
    onSwipeRight: enableSwipeBack ? handleBack : undefined,
    threshold: 50,
  })

  // Don't show back button on dashboard
  const shouldShowBack = showBackButton && pathname !== '/dashboard'

  return (
    <div
      className={cn(
        'sticky top-0 z-30 w-full border-b border-gray-200/50',
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-xl',
        'shadow-sm',
        className
      )}
      {...(enableSwipeBack ? swipeHandlers : {})}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left side - Back button */}
        <div className="flex items-center gap-3">
          {shouldShowBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-9 w-9 p-0 hover:bg-gray-100 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate md:text-base">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        {rightAction && (
          <div className="ml-4 shrink-0">
            {rightAction}
          </div>
        )}
      </div>

      {/* Swipe indicator */}
      {enableSwipeBack && (
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 transition-opacity" />
      )}
    </div>
  )
}

// Breadcrumb navigation for mobile
interface MobileBreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  className?: string
}

export function MobileBreadcrumb({ items, className }: MobileBreadcrumbProps) {
  return (
    <nav
      className={cn(
        'flex items-center space-x-2 px-4 py-2 text-sm text-gray-600',
        className
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className={cn(
                'hover:text-gray-900 transition-colors truncate',
                item.current && 'text-gray-900 font-medium'
              )}
            >
              {item.label}
            </a>
          ) : (
            <span
              className={cn(
                'truncate',
                item.current ? 'text-gray-900 font-medium' : 'text-gray-600'
              )}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// Enhanced tab navigation with swipe gestures
interface MobileTabNavigationProps {
  tabs: Array<{
    id: string
    label: string
    count?: number
    disabled?: boolean
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  enableSwipe?: boolean
  className?: string
}

export function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  enableSwipe = true,
  className,
}: MobileTabNavigationProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)

  const handleSwipeLeft = () => {
    if (activeIndex < tabs.length - 1) {
      const nextTab = tabs[activeIndex + 1]
      if (!nextTab.disabled) {
        onTabChange(nextTab.id)
      }
    }
  }

  const handleSwipeRight = () => {
    if (activeIndex > 0) {
      const prevTab = tabs[activeIndex - 1]
      if (!prevTab.disabled) {
        onTabChange(prevTab.id)
      }
    }
  }

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: enableSwipe ? handleSwipeLeft : undefined,
    onSwipeRight: enableSwipe ? handleSwipeRight : undefined,
    threshold: 80,
  })

  return (
    <div
      className={cn(
        'sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-200/50',
        className
      )}
      {...(enableSwipe ? swipeHandlers : {})}
    >
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center px-4 py-3 gap-1">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                'touch-manipulation select-none min-h-[44px]',
                tab.id === activeTab
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : tab.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-95'
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs',
                    tab.id === activeTab
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe indicators */}
      {enableSwipe && (
        <>
          {activeIndex > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-blue-500/10 to-transparent" />
          )}
          {activeIndex < tabs.length - 1 && (
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-blue-500/10 to-transparent" />
          )}
        </>
      )}
    </div>
  )
}

// Mobile search bar with enhanced UX
interface MobileSearchBarProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  showCancel?: boolean
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
}

export function MobileSearchBar({
  value,
  onValueChange,
  placeholder = 'Search...',
  showCancel = true,
  onCancel,
  autoFocus = false,
  className,
}: MobileSearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleCancel = () => {
    onValueChange('')
    inputRef.current?.blur()
    onCancel?.()
  }

  const handleClear = () => {
    onValueChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative px-4 py-3', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            'block w-full pl-10 pr-20 py-3 text-base bg-gray-100 border-0 rounded-xl',
            'placeholder-gray-500 text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white',
            'transition-all duration-200',
            isFocused && 'bg-white shadow-lg ring-2 ring-blue-500'
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {showCancel && (isFocused || value) && (
            <button
              onClick={handleCancel}
              className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 touch-manipulation px-2 py-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export type {
  MobileNavigationHeaderProps,
  MobileBreadcrumbProps,
  MobileTabNavigationProps,
  MobileSearchBarProps,
}