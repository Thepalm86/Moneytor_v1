import * as React from 'react'

import { cn } from '@/lib/utils'

// Enhanced Input component with mobile keyboard optimization
interface InputProps extends React.ComponentProps<'input'> {
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  mobileOptimized?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, mobileOptimized = true, ...props }, ref) => {
    // Auto-detect inputMode based on type if not explicitly provided
    const getInputMode = () => {
      if (inputMode) return inputMode
      
      switch (type) {
        case 'email': return 'email'
        case 'tel': return 'tel'
        case 'url': return 'url'
        case 'number': return 'decimal'
        case 'search': return 'search'
        default: return 'text'
      }
    }

    return (
      <input
        type={type}
        inputMode={getInputMode()}
        className={cn(
          // Mobile-first sizing with responsive breakpoints
          'flex h-14 w-full rounded-xl border-2 border-input bg-background/50 px-5 py-4 text-lg ring-offset-background backdrop-blur-sm transition-all duration-300 ease-in-out touch-manipulation',
          'md:h-12 md:px-4 md:py-3 md:text-base md:border', // Desktop scaling
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground/60',
          
          // Enhanced mobile hover and focus states
          'hover:border-primary/40 hover:bg-background/80 hover:shadow-md',
          'focus:border-primary focus:bg-background focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20',
          'active:border-primary active:bg-background',
          
          // Mobile-specific improvements
          mobileOptimized && [
            'focus:ring-offset-0', // Remove ring offset on mobile for better visibility
            'focus:shadow-2xl', // Enhanced shadow on mobile
            'selection:bg-primary/20', // Better text selection color
          ],
          
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

// Enhanced Floating Label Input Component with mobile optimization
interface FloatingInputProps extends React.ComponentProps<'input'> {
  label: string
  error?: string
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  mobileOptimized?: boolean
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, inputMode, mobileOptimized = true, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)

    React.useEffect(() => {
      setHasValue(!!props.value)
    }, [props.value])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      props.onBlur?.(e)
    }

    // Auto-detect inputMode based on type if not explicitly provided
    const getInputMode = () => {
      if (inputMode) return inputMode
      
      switch (type) {
        case 'email': return 'email'
        case 'tel': return 'tel'
        case 'url': return 'url'
        case 'number': return 'decimal'
        case 'search': return 'search'
        default: return 'text'
      }
    }

    const isFloating = isFocused || hasValue

    return (
      <div className="relative">
        <input
          {...props}
          type={type}
          inputMode={getInputMode()}
          ref={ref}
          className={cn(
            // Mobile-first sizing with enhanced touch optimization
            'peer flex h-16 w-full rounded-xl border-2 border-input bg-background/50 px-5 pb-3 pt-7 text-lg ring-offset-background backdrop-blur-sm transition-all duration-300 ease-in-out touch-manipulation',
            'md:h-14 md:px-4 md:pb-2 md:pt-6 md:text-base md:border', // Desktop scaling
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-transparent',
            
            // Enhanced mobile hover and focus states
            'hover:border-primary/40 hover:bg-background/80 hover:shadow-md',
            'focus:border-primary focus:bg-background focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20',
            'active:border-primary active:bg-background',
            
            // Mobile-specific improvements
            mobileOptimized && [
              'focus:ring-offset-0', // Remove ring offset on mobile
              'focus:shadow-2xl', // Enhanced shadow on mobile
              'selection:bg-primary/20', // Better text selection
            ],
            
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <label
          className={cn(
            // Mobile-first label positioning
            'pointer-events-none absolute left-5 top-5 text-lg text-muted-foreground/70 transition-all duration-300 ease-in-out',
            'md:left-4 md:top-4 md:text-base', // Desktop scaling
            
            // Focus and floating states
            'peer-focus:top-2.5 peer-focus:text-sm peer-focus:font-medium peer-focus:text-primary',
            'md:peer-focus:top-2 md:peer-focus:text-xs',
            
            // Floating state styles
            isFloating && 'top-2.5 text-sm font-medium md:top-2 md:text-xs',
            isFloating && !error && 'text-primary',
            error && 'text-destructive'
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-3 animate-slide-up text-sm text-destructive md:mt-2 md:text-xs">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = 'FloatingInput'

export { Input, FloatingInput }
