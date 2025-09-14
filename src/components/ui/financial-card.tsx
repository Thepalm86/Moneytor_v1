import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Card, CardContent, CardHeader } from './card'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'

const financialCardVariants = cva('group relative overflow-hidden', {
  variants: {
    variant: {
      default: 'bg-card hover:bg-card/95',
      income:
        'bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover:from-success-100 hover:to-success-200 dark:from-success-950 dark:to-success-900 dark:border-success-800',
      expense:
        'bg-gradient-to-br from-error-50 to-error-100 border-error-200 hover:from-error-100 hover:to-error-200 dark:from-error-950 dark:to-error-900 dark:border-error-800',
      neutral:
        'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700',
      primary:
        'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:from-primary-100 hover:to-primary-200 dark:from-primary-950 dark:to-primary-900 dark:border-primary-800',
    },
    size: {
      default: '',
      compact: 'p-4',
      large: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface FinancialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof financialCardVariants> {
  title: string
  value: string | number | React.ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  formatAsCurrency?: boolean
}

const FinancialCard = React.forwardRef<HTMLDivElement, FinancialCardProps>(
  (
    {
      className,
      variant,
      size,
      title,
      value,
      change,
      changeType = 'neutral',
      icon,
      subtitle,
      trend = 'neutral',
      formatAsCurrency = true,
      ...props
    },
    ref
  ) => {
    const { formatCurrency } = useCurrency()

    const formatValue = (val: string | number | React.ReactNode) => {
      if (React.isValidElement(val)) {
        return val
      }
      if (typeof val === 'number' && formatAsCurrency) {
        return formatCurrency(val, { decimals: val % 1 === 0 ? 0 : 2 })
      }
      return val
    }

    const getTrendIcon = () => {
      if (trend === 'up') return '↗'
      if (trend === 'down') return '↘'
      return '→'
    }

    const getChangeColorClass = () => {
      switch (changeType) {
        case 'positive':
          return 'text-success-600 dark:text-success-400'
        case 'negative':
          return 'text-error-600 dark:text-error-400'
        default:
          return 'text-muted-foreground'
      }
    }

    return (
      <Card
        ref={ref}
        className={cn(
          financialCardVariants({ variant, size }),
          'interactive-card cursor-default',
          className
        )}
        {...props}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
          </div>
          {icon && (
            <div className="text-muted-foreground/60 transition-colors duration-200 group-hover:text-muted-foreground/80">
              {icon}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-currency-lg font-bold">{formatValue(value)}</p>

              {change && (
                <div className="flex items-center space-x-1">
                  <span className={cn('text-sm font-medium', getChangeColorClass())}>
                    {getTrendIcon()} {change}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

FinancialCard.displayName = 'FinancialCard'

export { FinancialCard, financialCardVariants }
