/**
 * Accessibility Enhancements for Settings Redesign
 * WCAG 2.1 AA compliance improvements and utilities
 */

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Enhanced focus management hook
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const manageFocus = (element?: HTMLElement) => {
    const target = element || focusRef.current
    if (target) {
      target.focus()
      setIsFocused(true)
    }
  }

  const releaseFocus = () => {
    setIsFocused(false)
  }

  return { focusRef, isFocused, manageFocus, releaseFocus }
}

// Keyboard navigation hook for settings groups
export function useKeyboardNavigation(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(-1)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex(prev => (prev + 1) % itemCount)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex(prev => (prev - 1 + itemCount) % itemCount)
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(itemCount - 1)
        break
      case 'Escape':
        event.preventDefault()
        setActiveIndex(-1)
        break
    }
  }

  return { activeIndex, handleKeyDown, setActiveIndex }
}

// Screen reader announcements
export function useScreenReaderAnnouncements() {
  const [announcement, setAnnouncement] = useState('')

  const announce = (message: string) => {
    setAnnouncement(message)
    // Clear after announcement to allow re-announcing the same message
    setTimeout(() => setAnnouncement(''), 1000)
  }

  return { announcement, announce }
}

// Live region component for dynamic updates
export function LiveRegion({ 
  children, 
  priority = 'polite' 
}: { 
  children: React.ReactNode
  priority?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}

// Enhanced form field with accessibility improvements
interface AccessibleFormFieldProps {
  id: string
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function AccessibleFormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
  className,
}: AccessibleFormFieldProps) {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': [
            description ? descriptionId : '',
            error ? errorId : '',
          ].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required ? 'true' : undefined,
        })}
      </div>
      
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// Skip navigation component
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
    >
      Skip to main content
    </a>
  )
}

// Focus trap component for modals
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
}

export function FocusTrap({ children, active }: FocusTrapProps) {
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const trapElement = trapRef.current
    if (!trapElement) return

    const focusableElements = trapElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [active])

  return (
    <div ref={trapRef}>
      {children}
    </div>
  )
}

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    setIsHighContrast(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isHighContrast
}

// Reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Toast notification with accessibility
interface AccessibleToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onDismiss: () => void
}

export function AccessibleToast({ message, type = 'info', onDismiss }: AccessibleToastProps) {
  const { announce } = useScreenReaderAnnouncements()

  useEffect(() => {
    announce(message)
  }, [message, announce])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed top-4 right-4 p-4 rounded-md shadow-lg z-50',
        {
          'bg-green-100 text-green-800 border border-green-200': type === 'success',
          'bg-red-100 text-red-800 border border-red-200': type === 'error',
          'bg-yellow-100 text-yellow-800 border border-yellow-200': type === 'warning',
          'bg-blue-100 text-blue-800 border border-blue-200': type === 'info',
        }
      )}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-4 h-auto p-1"
        >
          ×
        </Button>
      </div>
    </div>
  )
}

// Progress indicator with accessibility
interface AccessibleProgressProps {
  value: number
  max: number
  label: string
  className?: string
}

export function AccessibleProgress({ value, max, label, className }: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="sr-only">
        Progress: {value} of {max} ({percentage}%)
      </div>
    </div>
  )
}

// Color contrast utilities
export function getContrastRatio(foreground: string, background: string): number {
  // Simplified contrast ratio calculation
  // In production, you would use a more robust color parsing library
  const getLuminance = (color: string) => {
    // This is a simplified version - use a proper color library in production
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7
}