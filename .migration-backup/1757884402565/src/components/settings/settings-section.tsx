'use client'

/**
 * Settings Section Component
 * Reusable section wrapper for settings pages
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  children: ReactNode
  className?: string
  headerActions?: ReactNode
  footerActions?: ReactNode
}

const gradients = {
  blue: 'from-blue-600 via-blue-700 to-indigo-700',
  green: 'from-green-600 via-emerald-700 to-teal-700',
  purple: 'from-purple-600 via-violet-700 to-indigo-700',
  orange: 'from-orange-600 via-amber-700 to-yellow-700',
  red: 'from-red-600 via-rose-700 to-pink-700',
  gray: 'from-gray-600 via-slate-700 to-gray-800',
}

const shadowColors = {
  blue: 'shadow-blue-500/20',
  green: 'shadow-green-500/20',
  purple: 'shadow-purple-500/20',
  orange: 'shadow-orange-500/20',
  red: 'shadow-red-500/20',
  gray: 'shadow-gray-500/20',
}

export function SettingsSection({
  title,
  description,
  icon,
  gradient = 'blue',
  children,
  className,
  headerActions,
  footerActions,
}: SettingsSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div
        className={cn(
          'relative rounded-2xl p-6 shadow-xl',
          `bg-gradient-to-r ${gradients[gradient]}`,
          shadowColors[gradient]
        )}
      >
        {/* Overlay for better text readability */}
        <div className={cn('absolute inset-0 rounded-2xl', `bg-gradient-to-r ${gradients[gradient]}/90`)} />

        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white text-xl backdrop-blur-sm">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {description && (
                  <p className="mt-2 text-base text-white/80">{description}</p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center space-x-3">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Decorative arrow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 transform">
          <div className="h-8 w-8 rotate-45 rounded-lg bg-white/10 backdrop-blur-sm" />
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        {children}
      </div>

      {/* Footer Actions */}
      {footerActions && (
        <div className="flex justify-end space-x-3">
          {footerActions}
        </div>
      )}
    </div>
  )
}

interface SettingsFormGroupProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  required?: boolean
}

export function SettingsFormGroup({
  title,
  description,
  children,
  className,
  required = false,
}: SettingsFormGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

interface SettingsCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  actions?: ReactNode
  variant?: 'default' | 'warning' | 'success' | 'error'
}

const cardVariants = {
  default: 'border-gray-200/50 bg-white/60',
  warning: 'border-amber-200/50 bg-amber-50/60',
  success: 'border-green-200/50 bg-green-50/60',
  error: 'border-red-200/50 bg-red-50/60',
}

export function SettingsCard({
  title,
  description,
  icon,
  children,
  className,
  actions,
  variant = 'default',
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md',
        cardVariants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900">{title}</h4>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
            <div className="mt-4">{children}</div>
          </div>
        </div>
        {actions && (
          <div className="ml-4 flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: SettingsToggleProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex-1">
        <label className={cn(
          'text-sm font-medium',
          disabled ? 'text-gray-400' : 'text-gray-900'
        )}>
          {label}
        </label>
        {description && (
          <p className={cn(
            'mt-1 text-sm',
            disabled ? 'text-gray-400' : 'text-gray-600'
          )}>
            {description}
          </p>
        )}
      </div>
      <label className="flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out',
            checked ? 'bg-blue-600' : 'bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm',
              checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </div>
      </label>
    </div>
  )
}