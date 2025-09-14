'use client'

/**
 * Settings Header Component - Redesigned
 * Clean, accessible header with search functionality and quick actions
 * Follows Moneytor V2 design patterns with simplified visual hierarchy
 */

import { ReactNode } from 'react'
import { Search, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SettingsHeaderProps {
  title?: string
  subtitle?: string
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  actions?: ReactNode
  className?: string
}

export function SettingsHeader({
  title = 'Settings',
  subtitle = 'Manage your account preferences and application settings',
  onSearch,
  searchPlaceholder = 'Search settings...',
  actions,
  className,
}: SettingsHeaderProps) {
  return (
    <div className={cn('space-y-6 pb-8 border-b border-gray-200', className)}>
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Header Actions */}
        {actions && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Search Section */}
      {onSearch && (
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="pl-10 pr-4 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          
          {/* Quick Filter Badges */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Quick filters:</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-200"
              onClick={() => onSearch?.('currency')}
            >
              Currency
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-green-50 hover:border-green-200"
              onClick={() => onSearch?.('security')}
            >
              Security
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-purple-50 hover:border-purple-200"
              onClick={() => onSearch?.('notifications')}
            >
              Alerts
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Settings Header Action - Standardized action button component
 */
interface SettingsHeaderActionProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
  className?: string
}

export function SettingsHeaderAction({
  children,
  onClick,
  variant = 'outline',
  disabled = false,
  className,
}: SettingsHeaderActionProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-10 px-4 font-medium',
        variant === 'outline' && 'border-gray-200 hover:bg-gray-50',
        className
      )}
    >
      {children}
    </Button>
  )
}

/**
 * Settings Breadcrumb - Optional breadcrumb navigation
 */
interface SettingsBreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  className?: string
}

export function SettingsBreadcrumb({ items, className }: SettingsBreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-2">
          {index > 0 && (
            <span className="text-gray-400">/</span>
          )}
          {item.current ? (
            <span className="font-medium text-gray-900" aria-current="page">
              {item.label}
            </span>
          ) : (
            <button
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => item.href && (window.location.href = item.href)}
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  )
}