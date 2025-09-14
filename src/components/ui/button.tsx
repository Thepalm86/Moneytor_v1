import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden touch-manipulation select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-95 active:shadow-lg',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg active:scale-95 active:shadow-lg',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/20 shadow-sm hover:shadow-md active:scale-95 active:shadow-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:scale-95 active:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:scale-95 active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
        success:
          'bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg active:scale-95 active:shadow-lg',
        warning:
          'bg-warning text-warning-foreground hover:bg-warning/90 shadow-md hover:shadow-lg active:scale-95 active:shadow-lg',
        gradient:
          'gradient-primary text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl active:scale-95 active:opacity-80',
      },
      size: {
        // Mobile-first touch targets (44px minimum)
        default: 'h-12 px-6 py-3 text-base md:h-10 md:px-4 md:py-2 md:text-sm', // 48px mobile, 40px desktop
        sm: 'h-11 px-4 py-2.5 text-sm md:h-9 md:px-3 md:text-xs', // 44px mobile, 36px desktop
        lg: 'h-14 px-8 py-3.5 text-lg md:h-12 md:px-6 md:text-base', // 56px mobile, 48px desktop
        xl: 'h-16 px-10 py-4 text-xl md:h-14 md:px-8 md:text-lg', // 64px mobile, 56px desktop
        
        // Icon buttons - mobile-first touch targets
        icon: 'h-12 w-12 md:h-10 md:w-10', // 48px mobile, 40px desktop
        'icon-sm': 'h-11 w-11 md:h-9 md:w-9', // 44px mobile, 36px desktop
        'icon-lg': 'h-14 w-14 md:h-12 md:w-12', // 56px mobile, 48px desktop
        'icon-xl': 'h-16 w-16 md:h-14 md:w-14', // 64px mobile, 56px desktop
        
        // Mobile-specific sizes
        'mobile-touch': 'h-14 px-8 py-3.5 text-base rounded-xl', // Optimized for mobile touch
        'mobile-fab': 'h-14 w-14 rounded-full shadow-2xl', // Floating Action Button
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
