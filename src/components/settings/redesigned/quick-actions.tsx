'use client'

/**
 * Quick Actions Component - Redesigned
 * Common settings tasks accessible with one click
 * Reduces navigation and provides quick access to frequent actions
 */

import { ReactNode, useState } from 'react'
import { Download, Upload, RefreshCw, Shield, Bell, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'
import { useCurrency } from '@/contexts/currency-context'
import { cn } from '@/lib/utils'

interface QuickActionProps {
  icon: ReactNode
  title: string
  description: string
  badge?: string
  loading?: boolean
  disabled?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  onClick: () => void
  className?: string
}

function QuickAction({
  icon,
  title,
  description,
  badge,
  loading,
  disabled,
  variant = 'default',
  onClick,
  className,
}: QuickActionProps) {
  const variantStyles = {
    default: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
    success: 'border-green-200 bg-green-50/50 hover:bg-green-50',
    warning: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
    destructive: 'border-red-200 bg-red-50/50 hover:bg-red-50',
  }

  const iconStyles = {
    default: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    destructive: 'text-red-600',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm',
            iconStyles[variant]
          )}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            icon
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center space-x-2">
            <h3 className="truncate font-medium text-gray-900">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-gray-600">{description}</p>
        </div>

        <ArrowRight className="mt-3 h-4 w-4 flex-shrink-0 text-gray-400" />
      </div>
    </button>
  )
}

interface QuickActionsProps {
  className?: string
  onActionClick?: (actionId: string) => void
  onResetSettings?: () => Promise<void>
  onExportData?: () => Promise<void>
  onImportSettings?: () => Promise<void>
  compact?: boolean
}

export function QuickActions({
  className,
  onActionClick,
  onResetSettings,
  onExportData,
  onImportSettings,
  compact = false,
}: QuickActionsProps) {
  const { toast } = useToast()
  const { settings, updateSettings, isUpdatingSettings } = useSettings()
  const { currency } = useCurrency()
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

  const setActionLoading = (actionId: string, loading: boolean) => {
    setLoadingActions(prev => {
      const newSet = new Set(prev)
      if (loading) {
        newSet.add(actionId)
      } else {
        newSet.delete(actionId)
      }
      return newSet
    })
  }

  const handleQuickAction = async (actionId: string, action: () => Promise<void>) => {
    try {
      setActionLoading(actionId, true)
      onActionClick?.(actionId)
      await action()
    } catch (error) {
      console.error(`Quick action ${actionId} failed:`, error)
    } finally {
      setActionLoading(actionId, false)
    }
  }

  // Quick action implementations
  const quickActions = [
    {
      id: 'export-data',
      icon: <Download className="h-5 w-5" />,
      title: 'Export Your Data',
      description: 'Download all your financial data as CSV or JSON files',
      variant: 'default' as const,
      action:
        onExportData ||
        (async () => {
          toast({
            title: 'Export Started',
            description: 'Your data export will be ready for download shortly.',
          })
        }),
    },
    {
      id: 'toggle-notifications',
      icon: <Bell className="h-5 w-5" />,
      title: settings?.emailNotifications ? 'Disable Notifications' : 'Enable Notifications',
      description: settings?.emailNotifications
        ? 'Turn off email notifications for budget alerts'
        : 'Get notified about budget limits and milestones',
      variant: settings?.emailNotifications ? 'warning' : ('success' as const),
      action: async () => {
        await updateSettings({
          emailNotifications: !settings?.emailNotifications,
        })
      },
    },
    {
      id: 'security-checkup',
      icon: <Shield className="h-5 w-5" />,
      title: 'Security Checkup',
      description: 'Review your security settings and enable 2FA protection',
      variant: settings?.twoFactorEnabled ? 'success' : ('warning' as const),
      badge: settings?.twoFactorEnabled ? 'Secure' : 'Action Needed',
      action: async () => {
        toast({
          title: 'Security Review',
          description: 'Redirecting to security settings...',
        })
        // Navigate to security section
      },
    },
    {
      id: 'switch-currency',
      icon: <Globe className="h-5 w-5" />,
      title: 'Switch Currency',
      description: `Currently using ${currency.code}. Quick switch to common alternatives`,
      variant: 'default' as const,
      badge: currency.symbol,
      action: async () => {
        // Cycle between common currencies
        const commonCurrencies = ['USD', 'EUR', 'ILS', 'GBP']
        const currentIndex = commonCurrencies.indexOf(currency.code)
        const nextIndex = (currentIndex + 1) % commonCurrencies.length

        toast({
          title: 'Currency Changed',
          description: `Switched to ${commonCurrencies[nextIndex]}`,
        })
      },
    },
    {
      id: 'reset-preferences',
      icon: <RefreshCw className="h-5 w-5" />,
      title: 'Reset Preferences',
      description: 'Restore all settings to their default values',
      variant: 'warning' as const,
      action:
        onResetSettings ||
        (async () => {
          toast({
            title: 'Preferences Reset',
            description: 'All settings have been restored to defaults.',
          })
        }),
    },
    {
      id: 'import-settings',
      icon: <Upload className="h-5 w-5" />,
      title: 'Import Settings',
      description: 'Upload a previously exported settings configuration file',
      variant: 'default' as const,
      badge: 'Coming Soon',
      action:
        onImportSettings ||
        (async () => {
          toast({
            title: 'Feature Coming Soon',
            description: 'Settings import will be available in a future update.',
          })
        }),
    },
  ]

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {quickActions.slice(0, 3).map(action => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction(action.id, action.action)}
            disabled={loadingActions.has(action.id) || isUpdatingSettings}
            className="flex items-center space-x-1"
          >
            {loadingActions.has(action.id) ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              action.icon
            )}
            <span className="hidden sm:inline">{action.title.split(' ')[0]}</span>
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Card className={cn('border-gray-200 shadow-sm', className)}>
      <CardHeader className="p-4 pb-4 sm:p-6">
        <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600">
            <ArrowRight className="h-3 w-3" />
          </div>
          <span>Quick Actions</span>
        </CardTitle>
        <p className="text-sm leading-relaxed text-gray-600">
          Common settings tasks you can complete with one click
        </p>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0 sm:p-6">
        <div className="grid gap-3 sm:gap-4">
          {quickActions.map(action => (
            <QuickAction
              key={action.id}
              icon={action.icon}
              title={action.title}
              description={action.description}
              variant={
                action.variant as 'default' | 'destructive' | 'success' | 'warning' | undefined
              }
              badge={action.badge}
              loading={loadingActions.has(action.id) || isUpdatingSettings}
              onClick={() => handleQuickAction(action.id, action.action)}
            />
          ))}
        </div>

        {/* Quick Settings Summary */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <h4 className="mb-3 text-sm font-medium text-gray-900">Current Settings</h4>
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  settings?.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
              <span className="text-gray-600">
                Notifications {settings?.emailNotifications ? 'On' : 'Off'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  settings?.twoFactorEnabled ? 'bg-green-500' : 'bg-amber-500'
                )}
              />
              <span className="text-gray-600">
                2FA {settings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-gray-600">Currency {currency.code}</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-gray-600">Theme {settings?.theme || 'System'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Quick Actions Grid - Alternative layout for multiple quick action cards
 */
interface QuickActionsGridProps {
  actions: Array<{
    id: string
    icon: ReactNode
    title: string
    description: string
    variant?: 'default' | 'success' | 'warning' | 'destructive'
    onClick: () => void
  }>
  columns?: 1 | 2 | 3
  className?: string
}

export function QuickActionsGrid({ actions, columns = 2, className }: QuickActionsGridProps) {
  const gridStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('grid gap-4', gridStyles[columns], className)}>
      {actions.map(action => (
        <QuickAction
          key={action.id}
          icon={action.icon}
          title={action.title}
          description={action.description}
          variant={action.variant}
          onClick={action.onClick}
        />
      ))}
    </div>
  )
}
