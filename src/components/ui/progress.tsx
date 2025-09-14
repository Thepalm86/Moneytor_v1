'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const progressVariants = cva('relative overflow-hidden rounded-full transition-all duration-300', {
  variants: {
    variant: {
      default: 'bg-secondary',
      success: 'bg-success-100 dark:bg-success-900',
      warning: 'bg-warning-100 dark:bg-warning-900',
      error: 'bg-error-100 dark:bg-error-900',
    },
    size: {
      default: 'h-2',
      sm: 'h-1.5',
      lg: 'h-3',
      xl: 'h-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-500 ease-out relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-gradient-to-r from-success-500 to-success-600',
        warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
        error: 'bg-gradient-to-r from-error-500 to-error-600',
      },
      animated: {
        true: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  animated?: boolean
  showPercentage?: boolean
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  (
    { className, value, variant, size, animated = false, showPercentage = false, ...props },
    ref
  ) => (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ variant, size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant, animated }))}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(value || 0)}%</span>
        </div>
      )}
    </div>
  )
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
