import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-base ring-offset-background backdrop-blur-sm transition-all duration-300 ease-in-out',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground/60',
          'hover:border-primary/40 hover:bg-background/80 hover:shadow-md',
          'focus-visible:border-primary focus-visible:bg-background focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

// Floating Label Input Component
interface FloatingInputProps extends React.ComponentProps<'input'> {
  label: string
  error?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, ...props }, ref) => {
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

    const isFloating = isFocused || hasValue

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          className={cn(
            'peer flex h-14 w-full rounded-xl border border-input bg-background/50 px-4 pb-2 pt-6 text-base ring-offset-background backdrop-blur-sm transition-all duration-300 ease-in-out',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-transparent',
            'hover:border-primary/40 hover:bg-background/80 hover:shadow-md',
            'focus:border-primary focus:bg-background focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            'md:text-sm',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <label
          className={cn(
            'pointer-events-none absolute left-4 top-4 text-base text-muted-foreground/70 transition-all duration-300 ease-in-out',
            'peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary',
            isFloating && 'top-2 text-xs font-medium',
            isFloating && !error && 'text-primary',
            error && 'text-destructive',
            'md:text-sm peer-focus:md:text-xs',
            isFloating && 'md:text-xs'
          )}
        >
          {label}
        </label>
        {error && <p className="mt-2 animate-slide-up text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
FloatingInput.displayName = 'FloatingInput'

export { Input, FloatingInput }
