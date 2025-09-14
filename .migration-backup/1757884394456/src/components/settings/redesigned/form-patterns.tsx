'use client'

/**
 * Unified Form Patterns for Settings
 * Standardized form components and validation patterns
 * Ensures consistency across all settings forms
 */

import { ReactNode, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
// import { Button } from '@/components/ui/button' // Removed - not used in this file
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Form Field Container
interface FormFieldProps {
  children: ReactNode
  error?: string
  success?: string
  warning?: string
  info?: string
  className?: string
}

export function FormField({
  children,
  error,
  success,
  warning,
  info,
  className,
}: FormFieldProps) {
  const hasMessage = error || success || warning || info
  
  return (
    <div className={cn('space-y-2', className)}>
      {children}
      
      {hasMessage && (
        <div className="space-y-2">
          {error && (
            <div className="flex items-start space-x-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}
          
          {warning && (
            <div className="flex items-start space-x-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{warning}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-start space-x-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{success}</span>
            </div>
          )}
          
          {info && (
            <div className="flex items-start space-x-2 text-sm text-blue-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{info}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Form Section
interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-medium text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed">
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

// Form Actions
interface FormActionsProps {
  children: ReactNode
  align?: 'left' | 'right' | 'center' | 'between'
  className?: string
}

export function FormActions({
  children,
  align = 'right',
  className,
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  }

  return (
    <div className={cn(
      'flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100',
      alignmentClasses[align],
      className
    )}>
      {children}
    </div>
  )
}

// Settings Form Container
interface SettingsFormProps {
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  loading?: boolean
  className?: string
}

export function SettingsForm({
  title,
  description,
  children,
  actions,
  loading,
  className,
}: SettingsFormProps) {
  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      {(title || description) && (
        <div className="space-y-2 mb-6">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn('space-y-6', loading && 'opacity-50 pointer-events-none')}>
        {children}
      </div>
      
      {actions && (
        <FormActions className="mt-6">
          {actions}
        </FormActions>
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Updating settings...</span>
          </div>
        </div>
      )}
    </Card>
  )
}

// Change Indicator
interface ChangeIndicatorProps {
  hasChanges: boolean
  className?: string
}

export function ChangeIndicator({ hasChanges, className }: ChangeIndicatorProps) {
  if (!hasChanges) return null
  
  return (
    <Badge variant="warning" className={cn('ml-2', className)}>
      Unsaved
    </Badge>
  )
}

// Settings Value Display
interface SettingsValueProps {
  label: string
  value: ReactNode
  badge?: string
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive'
  actions?: ReactNode
  className?: string
}

export function SettingsValue({
  label,
  value,
  badge,
  badgeVariant = 'default',
  actions,
  className,
}: SettingsValueProps) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-gray-100 last:border-b-0',
      className
    )}>
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {label}
          </span>
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {value}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

// Quick Setting Toggle
interface QuickToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function QuickToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  loading,
  className,
}: QuickToggleProps) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-lg border bg-white hover:bg-gray-50/50 transition-colors',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}>
      <div className="space-y-1 min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">
          {label}
        </div>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && !loading && onChange(!checked)}
          disabled={disabled || loading}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            checked ? 'bg-blue-600' : 'bg-gray-200',
            disabled && 'cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
              checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </div>
  )
}

// Form Validation Helpers
export const formValidation = {
  email: (value: string): string | null => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Please enter a valid email address'
  },
  
  required: (value: any): string | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return null
  },
  
  minLength: (min: number) => (value: string): string | null => {
    if (!value) return null
    return value.length >= min ? null : `Must be at least ${min} characters`
  },
  
  maxLength: (max: number) => (value: string): string | null => {
    if (!value) return null
    return value.length <= max ? null : `Must be no more than ${max} characters`
  },
  
  currency: (value: string): string | null => {
    if (!value) return null
    const currencyRegex = /^[A-Z]{3}$/
    return currencyRegex.test(value) ? null : 'Must be a valid 3-letter currency code'
  },
  
  url: (value: string): string | null => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },
}

// Form State Management Hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: Partial<Record<keyof T, ((value: any) => string | null)[]>>
) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  
  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Validate field if it has been touched or if it's currently invalid
    if (touched[field] || errors[field]) {
      validateField(field, value)
    }
  }
  
  const setFieldTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, values[field])
  }
  
  const validateField = (field: keyof T, value: any) => {
    const fieldValidators = validators[field] || []
    let error: string | null = null
    
    for (const validator of fieldValidators) {
      error = validator(value)
      if (error) break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }
  
  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true
    
    Object.keys(validators).forEach(field => {
      const fieldKey = field as keyof T
      const fieldValidators = validators[fieldKey] || []
      let error: string | null = null
      
      for (const validator of fieldValidators) {
        error = validator(values[fieldKey])
        if (error) break
      }
      
      if (error) {
        newErrors[fieldKey] = error
        isValid = false
      }
    })
    
    setErrors(newErrors)
    return isValid
  }
  
  const hasChanges = (originalValues: T): boolean => {
    return Object.keys(values).some(key => {
      const fieldKey = key as keyof T
      return values[fieldKey] !== originalValues[fieldKey]
    })
  }
  
  const reset = (newValues?: T) => {
    setValues(newValues || initialValues)
    setErrors({})
    setTouched({})
  }
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    hasChanges,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}