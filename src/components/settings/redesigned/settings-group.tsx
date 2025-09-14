'use client'

/**
 * Settings Group Component - Redesigned
 * Simplified, scannable group container that replaces complex sections
 * Focuses on clean typography hierarchy and progressive disclosure
 */

import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SettingsGroupProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  defaultExpanded?: boolean
  collapsible?: boolean
  badge?: string | number
  actions?: ReactNode
  priority?: 'high' | 'medium' | 'low'
}

export function SettingsGroup({
  title,
  description,
  icon,
  children,
  className,
  defaultExpanded = true,
  collapsible = false,
  badge,
  actions,
  priority = 'medium',
}: SettingsGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const priorityStyles = {
    high: 'border-blue-200 bg-blue-50/30',
    medium: 'border-gray-200 bg-white',
    low: 'border-gray-100 bg-gray-50/50',
  }

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200 hover:shadow-md',
        priorityStyles[priority],
        className
      )}
    >
      {/* Group Header */}
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6',
          collapsible && 'cursor-pointer hover:bg-gray-50/50 transition-colors'
        )}
        onClick={handleToggle}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
      >
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {icon && (
            <div className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 flex-shrink-0 text-lg sm:text-base">
              {icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-lg font-semibold text-gray-900 truncate">
                {title}
              </h2>
              
              {badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start sm:self-center">
                  {badge}
                </span>
              )}
            </div>
            
            {description && (
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
          
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Group Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Settings Subgroup - For nested organization within groups
 */
interface SettingsSubgroupProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsSubgroup({
  title,
  description,
  children,
  className,
}: SettingsSubgroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="pb-3 border-b border-gray-100">
        <h3 className="text-base font-medium text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

/**
 * Settings Group Grid - For organizing multiple groups in a grid layout
 */
interface SettingsGroupGridProps {
  children: ReactNode
  columns?: 1 | 2
  className?: string
}

export function SettingsGroupGrid({
  children,
  columns = 1,
  className,
}: SettingsGroupGridProps) {
  const gridStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
  }

  return (
    <div
      className={cn(
        'grid gap-6',
        gridStyles[columns],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Settings Group Action - Standardized action button for group headers
 */
interface SettingsGroupActionProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default'
  disabled?: boolean
  className?: string
}

export function SettingsGroupAction({
  children,
  onClick,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  className,
}: SettingsGroupActionProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-xs font-medium',
        variant === 'ghost' && 'hover:bg-gray-100',
        className
      )}
    >
      {children}
    </Button>
  )
}