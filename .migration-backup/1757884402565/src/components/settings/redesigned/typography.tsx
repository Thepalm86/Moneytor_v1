'use client'

/**
 * Clean Typography Hierarchy for Settings
 * Consistent typography patterns that replace visual overload
 * Focus on scannable information hierarchy
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Typography Scale - Based on 8px grid system
const typographyScale = {
  // Headings
  h1: 'text-2xl sm:text-3xl font-bold tracking-tight',
  h2: 'text-xl sm:text-2xl font-semibold tracking-tight', 
  h3: 'text-lg sm:text-xl font-semibold',
  h4: 'text-base sm:text-lg font-medium',
  h5: 'text-sm sm:text-base font-medium',
  h6: 'text-xs sm:text-sm font-medium uppercase tracking-wide',
  
  // Body text
  body: 'text-sm sm:text-base leading-relaxed',
  'body-sm': 'text-xs sm:text-sm leading-relaxed',
  'body-lg': 'text-base sm:text-lg leading-relaxed',
  
  // Labels and UI text
  label: 'text-sm font-medium',
  caption: 'text-xs text-muted-foreground',
  overline: 'text-xs font-medium uppercase tracking-wide text-muted-foreground',
  
  // Interactive elements
  button: 'text-sm font-medium',
  link: 'text-sm font-medium text-blue-600 hover:text-blue-700',
  
  // Code and monospace
  code: 'text-sm font-mono bg-gray-100 px-1.5 py-0.5 rounded',
  'code-block': 'text-sm font-mono bg-gray-100 p-3 rounded-lg',
} as const

// Typography Components
interface TypographyProps {
  children: ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

// Page Title - Primary heading for entire page
export function PageTitle({ children, className, as: Component = 'h1' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.h1, 'text-gray-900', className)}>
      {children}
    </Component>
  )
}

// Section Title - Major sections within a page
export function SectionTitle({ children, className, as: Component = 'h2' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.h2, 'text-gray-900', className)}>
      {children}
    </Component>
  )
}

// Group Title - Settings groups and subsections
export function GroupTitle({ children, className, as: Component = 'h3' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.h3, 'text-gray-900', className)}>
      {children}
    </Component>
  )
}

// Item Title - Individual settings or form fields
export function ItemTitle({ children, className, as: Component = 'h4' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.h4, 'text-gray-900', className)}>
      {children}
    </Component>
  )
}

// Subtitle - Supporting headings
export function Subtitle({ children, className, as: Component = 'h5' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.h5, 'text-gray-700', className)}>
      {children}
    </Component>
  )
}

// Overline - Category labels and section dividers
export function Overline({ children, className, as: Component = 'h6' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.h6, 'text-gray-500', className)}>
      {children}
    </Component>
  )
}

// Body Text
export function BodyText({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.body, 'text-gray-700', className)}>
      {children}
    </Component>
  )
}

// Small Body Text
export function SmallText({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale['body-sm'], 'text-gray-600', className)}>
      {children}
    </Component>
  )
}

// Large Body Text
export function LargeText({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale['body-lg'], 'text-gray-700', className)}>
      {children}
    </Component>
  )
}

// Label Text
export function LabelText({ children, className, as: Component = 'label' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.label, 'text-gray-900', className)}>
      {children}
    </Component>
  )
}

// Caption Text
export function CaptionText({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.caption, className)}>
      {children}
    </Component>
  )
}

// Link Text
export function LinkText({ children, className, as: Component = 'a' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.link, 'underline-offset-4 hover:underline', className)}>
      {children}
    </Component>
  )
}

// Code Text
export function CodeText({ children, className, as: Component = 'code' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale.code, className)}>
      {children}
    </Component>
  )
}

// Code Block
export function CodeBlock({ children, className, as: Component = 'pre' }: TypographyProps) {
  return (
    <Component className={cn(typographyScale['code-block'], 'overflow-x-auto', className)}>
      <code>{children}</code>
    </Component>
  )
}

// Text Emphasis
interface EmphasisProps {
  children: ReactNode
  className?: string
  variant?: 'subtle' | 'medium' | 'strong'
}

export function Emphasis({ children, className, variant = 'medium' }: EmphasisProps) {
  const variantStyles = {
    subtle: 'font-medium text-gray-700',
    medium: 'font-semibold text-gray-800',
    strong: 'font-bold text-gray-900',
  }

  return (
    <span className={cn(variantStyles[variant], className)}>
      {children}
    </span>
  )
}

// Muted Text
export function MutedText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-muted-foreground', className)}>
      {children}
    </Component>
  )
}

// Success Text
export function SuccessText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-green-700 font-medium', className)}>
      {children}
    </Component>
  )
}

// Warning Text
export function WarningText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-amber-700 font-medium', className)}>
      {children}
    </Component>
  )
}

// Error Text
export function ErrorText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-red-700 font-medium', className)}>
      {children}
    </Component>
  )
}

// Info Text
export function InfoText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-blue-700 font-medium', className)}>
      {children}
    </Component>
  )
}

// Typography Utilities
export const typography = {
  // Direct access to scales
  scale: typographyScale,
  
  // Helper functions
  getScale: (key: keyof typeof typographyScale) => typographyScale[key],
  
  // Responsive text sizing
  responsive: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base', 
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
  },
  
  // Text colors for different contexts
  colors: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700', 
    tertiary: 'text-gray-600',
    muted: 'text-gray-500',
    placeholder: 'text-gray-400',
    disabled: 'text-gray-300',
    success: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    link: 'text-blue-600 hover:text-blue-700',
  },
  
  // Line heights
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  },
  
  // Letter spacing
  tracking: {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
  },
}

// Text utilities for specific use cases
export const textUtils = {
  // Truncation
  truncate: 'truncate',
  'truncate-2': 'line-clamp-2',
  'truncate-3': 'line-clamp-3',
  
  // Text alignment
  'text-left': 'text-left',
  'text-center': 'text-center',
  'text-right': 'text-right',
  'text-justify': 'text-justify',
  
  // Text transform
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  'normal-case': 'normal-case',
  
  // Text decoration
  underline: 'underline',
  'no-underline': 'no-underline',
  'line-through': 'line-through',
}

// Export all typography classes for consumption
export const typographyClasses = {
  ...typographyScale,
  ...typography.colors,
  ...typography.leading,
  ...typography.tracking,
  ...textUtils,
}