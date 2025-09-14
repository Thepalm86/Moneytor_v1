'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Card, CardProps } from '@/components/ui/card'

const mobileCardVariants = cva(
  'transition-all duration-200 ease-in-out touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border shadow-sm',
        elevated: 'bg-card text-card-foreground border-0 shadow-lg hover:shadow-xl',
        glass: 'bg-white/60 text-card-foreground border-0 backdrop-blur-xl shadow-lg',
        flat: 'bg-card text-card-foreground border-0 shadow-none',
        interactive: 'bg-card text-card-foreground border shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]',
      },
      size: {
        sm: 'p-4 rounded-xl md:p-3 md:rounded-lg',
        default: 'p-6 rounded-2xl md:p-4 md:rounded-xl',
        lg: 'p-8 rounded-2xl md:p-6 md:rounded-xl',
      },
      spacing: {
        none: 'space-y-0',
        sm: 'space-y-3 md:space-y-2',
        default: 'space-y-4 md:space-y-3', 
        lg: 'space-y-6 md:space-y-4',
      },
      touchOptimized: {
        true: 'min-h-[44px] focus-within:ring-2 focus-within:ring-primary/20',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      spacing: 'default',
      touchOptimized: true,
    },
  }
)

interface MobileCardProps 
  extends CardProps,
    VariantProps<typeof mobileCardVariants> {
  touchOptimized?: boolean
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, variant, size, spacing, touchOptimized, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          mobileCardVariants({ variant, size, spacing, touchOptimized }),
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )
  }
)
MobileCard.displayName = 'MobileCard'

// Mobile-optimized grid container
interface MobileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3
  gap?: 'sm' | 'default' | 'lg'
  responsive?: boolean
}

const MobileGrid = React.forwardRef<HTMLDivElement, MobileGridProps>(
  ({ className, cols = 1, gap = 'default', responsive = true, children, ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-3 md:gap-2',
      default: 'gap-4 md:gap-3',
      lg: 'gap-6 md:gap-4',
    }

    const colClasses = responsive ? {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    } : {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colClasses[cols],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileGrid.displayName = 'MobileGrid'

// Mobile-optimized list container
interface MobileListProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'default' | 'lg'
  dividers?: boolean
}

const MobileList = React.forwardRef<HTMLDivElement, MobileListProps>(
  ({ className, spacing = 'default', dividers = false, children, ...props }, ref) => {
    const spacingClasses = {
      sm: 'space-y-2',
      default: 'space-y-3',
      lg: 'space-y-4',
    }

    return (
      <div
        ref={ref}
        className={cn(
          spacingClasses[spacing],
          dividers && 'divide-y divide-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileList.displayName = 'MobileList'

// Mobile-optimized section container
interface MobileSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  action?: React.ReactNode
  spacing?: 'sm' | 'default' | 'lg'
}

const MobileSection = React.forwardRef<HTMLElement, MobileSectionProps>(
  ({ className, title, description, action, spacing = 'default', children, ...props }, ref) => {
    const spacingClasses = {
      sm: 'space-y-3',
      default: 'space-y-4',
      lg: 'space-y-6',
    }

    return (
      <section
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {(title || description || action) && (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <h2 className="text-xl font-bold text-foreground md:text-lg">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-base text-muted-foreground md:text-sm">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="ml-4 shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </section>
    )
  }
)
MobileSection.displayName = 'MobileSection'

export { 
  MobileCard, 
  MobileGrid, 
  MobileList, 
  MobileSection,
  mobileCardVariants,
}

export type { 
  MobileCardProps, 
  MobileGridProps, 
  MobileListProps, 
  MobileSectionProps 
}