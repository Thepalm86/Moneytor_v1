'use client'

import * as React from 'react'
import { Eye, EyeOff, Calendar, Clock, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Enhanced floating label input
interface MobileFloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onEndIconClick?: () => void
}

export const MobileFloatingInput = React.forwardRef<HTMLInputElement, MobileFloatingInputProps>(
  ({ className, label, error, helperText, startIcon, endIcon, onEndIconClick, type = 'text', ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)
    const [showPassword, setShowPassword] = React.useState(false)

    const isFloating = focused || hasValue || props.placeholder
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    // Auto-detect input modes for better mobile keyboards
    const getInputMode = (inputType: string): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
      switch (inputType) {
        case 'email':
          return 'email'
        case 'tel':
          return 'tel'
        case 'number':
          return 'numeric'
        case 'url':
          return 'url'
        default:
          return 'text'
      }
    }

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              {startIcon}
            </div>
          )}

          {/* Input */}
          <Input
            ref={ref}
            type={inputType}
            inputMode={getInputMode(inputType)}
            className={cn(
              // Mobile-first sizing
              'h-14 text-base transition-all duration-200',
              'border-2 rounded-xl',
              // Padding adjustments for icons and floating label
              startIcon && 'pl-12',
              (endIcon || isPassword) && 'pr-12',
              isFloating && 'pt-6 pb-2',
              !isFloating && 'pt-4 pb-4',
              // Focus and error states
              focused && !error && 'border-blue-500 ring-2 ring-blue-500/20',
              error && 'border-red-500 ring-2 ring-red-500/20',
              !focused && !error && 'border-gray-300 hover:border-gray-400'
            )}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            onChange={handleValueChange}
            {...props}
          />

          {/* Floating label */}
          <label
            className={cn(
              'absolute left-4 text-gray-500 pointer-events-none transition-all duration-200',
              startIcon && 'left-12',
              isFloating
                ? 'top-2 text-xs font-medium'
                : 'top-1/2 -translate-y-1/2 text-base',
              focused && !error && 'text-blue-600',
              error && 'text-red-600'
            )}
          >
            {label}
          </label>

          {/* End icon or password toggle */}
          {(endIcon || isPassword) && (
            <button
              type="button"
              onClick={isPassword ? () => setShowPassword(!showPassword) : onEndIconClick}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isPassword ? (
                showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />
              ) : (
                endIcon
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <span className="w-1 h-1 bg-red-600 rounded-full" />
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
MobileFloatingInput.displayName = 'MobileFloatingInput'

// Mobile-optimized textarea
interface MobileFloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  maxLength?: number
}

export const MobileFloatingTextarea = React.forwardRef<HTMLTextAreaElement, MobileFloatingTextareaProps>(
  ({ className, label, error, helperText, maxLength, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)
    const [charCount, setCharCount] = React.useState(0)

    const isFloating = focused || hasValue || props.placeholder

    const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value)
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <Textarea
            ref={ref}
            maxLength={maxLength}
            className={cn(
              'min-h-[120px] text-base transition-all duration-200 resize-none',
              'border-2 rounded-xl',
              isFloating && 'pt-6 pb-4',
              !isFloating && 'pt-4 pb-4',
              focused && !error && 'border-blue-500 ring-2 ring-blue-500/20',
              error && 'border-red-500 ring-2 ring-red-500/20',
              !focused && !error && 'border-gray-300 hover:border-gray-400'
            )}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            onChange={handleValueChange}
            {...props}
          />

          <label
            className={cn(
              'absolute left-4 text-gray-500 pointer-events-none transition-all duration-200',
              isFloating
                ? 'top-2 text-xs font-medium'
                : 'top-4 text-base',
              focused && !error && 'text-blue-600',
              error && 'text-red-600'
            )}
          >
            {label}
          </label>
        </div>

        {/* Character count */}
        {maxLength && (
          <div className="mt-2 flex justify-end">
            <span className={cn(
              'text-xs',
              charCount > maxLength * 0.8 ? 'text-orange-600' : 'text-gray-500'
            )}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <span className="w-1 h-1 bg-red-600 rounded-full" />
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
MobileFloatingTextarea.displayName = 'MobileFloatingTextarea'

// Mobile-optimized date picker
interface MobileDatePickerProps {
  label: string
  value?: Date
  onChange: (date: Date | undefined) => void
  error?: string
  helperText?: string
  placeholder?: string
}

export function MobileDatePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Select date'
}: MobileDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-14 w-full justify-between text-left font-normal border-2 rounded-xl',
              !value && 'text-muted-foreground',
              error && 'border-red-500 ring-2 ring-red-500/20'
            )}
          >
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-500 mb-0.5">
                {label}
              </span>
              <span className="text-base">
                {value ? format(value, 'PPP') : placeholder}
              </span>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
          <span className="w-1 h-1 bg-red-600 rounded-full" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Mobile-optimized amount input with currency
interface MobileAmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  currency?: string
  onChange: (value: number | undefined) => void
  error?: string
  helperText?: string
}

export function MobileAmountInput({
  label,
  currency = '$',
  onChange,
  error,
  helperText,
  className,
  ...props
}: MobileAmountInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    const numericValue = parseFloat(value)
    
    setDisplayValue(value)
    onChange(isNaN(numericValue) ? undefined : numericValue)
  }

  React.useEffect(() => {
    if (props.value !== undefined) {
      setDisplayValue(props.value.toString())
    }
  }, [props.value])

  return (
    <MobileFloatingInput
      {...props}
      label={label}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      startIcon={<DollarSign className="h-5 w-5" />}
      className={className}
    />
  )
}

// Mobile form section
interface MobileFormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function MobileFormSection({ 
  title, 
  description, 
  children, 
  className 
}: MobileFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export type {
  MobileFloatingInputProps,
  MobileFloatingTextareaProps,
  MobileDatePickerProps,
  MobileAmountInputProps,
  MobileFormSectionProps,
}