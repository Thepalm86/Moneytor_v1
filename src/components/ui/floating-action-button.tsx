'use client'

import * as React from 'react'
import { LucideIcon, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'

interface FloatingActionButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  icon?: LucideIcon
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  size?: 'default' | 'lg' | 'xl'
  extended?: boolean
  label?: string
}

export function FloatingActionButton({
  icon: Icon = Plus,
  position = 'bottom-right',
  size = 'default',
  extended = false,
  label,
  className,
  children,
  ...props
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-6',
    'bottom-left': 'bottom-20 left-6', 
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  }

  const sizeClasses = {
    default: extended ? 'h-14 px-6' : 'h-14 w-14',
    lg: extended ? 'h-16 px-8' : 'h-16 w-16',
    xl: extended ? 'h-18 px-10' : 'h-18 w-18',
  }

  const iconSizeClasses = {
    default: 'h-6 w-6',
    lg: 'h-7 w-7',
    xl: 'h-8 w-8',
  }

  return (
    <Button
      className={cn(
        // Fixed positioning with z-index for overlay
        'fixed z-50',
        positionClasses[position],
        
        // Mobile-optimized FAB styling
        'rounded-full bg-primary text-primary-foreground shadow-2xl',
        'hover:bg-primary/90 hover:shadow-3xl',
        'active:scale-95 active:shadow-xl',
        'transition-all duration-200 ease-in-out',
        
        // Touch optimization
        'touch-manipulation select-none',
        
        // Focus states
        'focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background',
        
        // Size classes
        sizeClasses[size],
        
        // Extended button specific styles
        extended && [
          'justify-start gap-3',
          'backdrop-blur-sm',
          'border border-primary/20',
        ],
        
        className
      )}
      {...props}
    >
      <Icon className={cn(iconSizeClasses[size], 'shrink-0')} />
      {extended && (label || children) && (
        <span className="font-semibold">
          {label || children}
        </span>
      )}
    </Button>
  )
}

// Speed Dial FAB - Multiple actions from one FAB
interface SpeedDialAction {
  icon: LucideIcon
  label: string
  onClick: () => void
  color?: string
}

interface SpeedDialFABProps {
  actions: SpeedDialAction[]
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  className?: string
}

export function SpeedDialFAB({
  actions,
  position = 'bottom-right',
  className
}: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-20 right-6',
    'bottom-left': 'bottom-20 left-6',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  }

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Speed dial actions */}
      {isOpen && (
        <div className="absolute bottom-16 flex flex-col-reverse gap-3">
          {actions.map((action, index) => {
            const ActionIcon = action.icon
            return (
              <div
                key={action.label}
                className="flex items-center gap-3"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideInUp 200ms ease-out forwards',
                }}
              >
                {/* Action label */}
                <div className="rounded-lg bg-gray-900/90 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  {action.label}
                </div>
                
                {/* Action button */}
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    'h-12 w-12 rounded-full shadow-lg',
                    'hover:shadow-xl active:scale-95',
                    'transition-all duration-200',
                    action.color && `bg-${action.color}-500 text-white hover:bg-${action.color}-600`
                  )}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                >
                  <ActionIcon className="h-5 w-5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'transition-transform duration-200',
          isOpen && 'rotate-45'
        )}
        aria-label={isOpen ? 'Close actions' : 'Open actions'}
        aria-expanded={isOpen}
      />

      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export type { FloatingActionButtonProps, SpeedDialAction }