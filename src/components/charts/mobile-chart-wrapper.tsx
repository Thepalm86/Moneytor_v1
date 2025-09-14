'use client'

import * as React from 'react'
import { ResponsiveContainer } from 'recharts'
import { Download, Maximize2, Minimize2, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MobileCard } from '@/components/ui/mobile-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface MobileChartWrapperProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  height?: number
  expandable?: boolean
  downloadable?: boolean
  onDownload?: () => void
  onRefresh?: () => void
  className?: string
  loading?: boolean
  error?: string
}

export function MobileChartWrapper({
  title,
  subtitle,
  children,
  height = 280,
  expandable = true,
  downloadable = false,
  onDownload,
  onRefresh,
  className,
  loading = false,
  error,
}: MobileChartWrapperProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const ChartContent = () => (
    <div className="relative">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500">Loading chart...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      )}
    </div>
  )

  return (
    <MobileCard variant="default" className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-4">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
          
          {downloadable && onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {expandable && (
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full max-h-full h-full w-full p-0">
                <DialogHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <DialogTitle>{title}</DialogTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="h-8 w-8 p-0"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogHeader>
                <div className="flex-1 p-4 pt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    {children}
                  </ResponsiveContainer>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4 pt-2">
        <ChartContent />
      </div>
    </MobileCard>
  )
}

// Mobile chart configuration helpers
export const mobileChartConfig = {
  // Responsive margin for mobile
  margin: { top: 10, right: 10, left: 0, bottom: 10 },
  
  // Touch-friendly tick formatting
  tickConfig: {
    fontSize: 12,
    tickMargin: 8,
    interval: 'preserveStartEnd' as const,
  },

  // Mobile-optimized colors
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981', 
    accent: '#F59E0B',
    danger: '#EF4444',
    muted: '#6B7280',
  },

  // Animation config for mobile
  animation: {
    animationDuration: 300,
    animationBegin: 0,
  }
}

// Custom tooltip for mobile charts
interface MobileChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string) => [string, string]
  labelFormatter?: (label: string) => string
}

export function MobileChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter
}: MobileChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      {label && (
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mobile chart legend
interface MobileChartLegendProps {
  payload?: Array<{
    value: string
    color: string
    type?: string
  }>
  className?: string
}

export function MobileChartLegend({ payload = [], className }: MobileChartLegendProps) {
  if (!payload.length) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-4 mt-4', className)}>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export type { MobileChartWrapperProps, MobileChartTooltipProps, MobileChartLegendProps }