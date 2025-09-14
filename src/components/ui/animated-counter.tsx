'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

const AnimatedCounter = React.forwardRef<HTMLSpanElement, AnimatedCounterProps>(
  (
    {
      className,
      value,
      duration = 1000,
      decimals = 0,
      prefix = '',
      suffix = '',
      formatter,
      ...props
    },
    _ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)
    const counterRef = React.useRef<HTMLSpanElement>(null)
    const frameRef = React.useRef<number>()
    const startTimeRef = React.useRef<number>()
    const startValueRef = React.useRef(0)

    const formatValue = React.useCallback(
      (val: number) => {
        if (formatter) {
          return formatter(val)
        }
        return val.toFixed(decimals)
      },
      [decimals, formatter]
    )

    const animateCounter = React.useCallback(
      (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp
          startValueRef.current = displayValue
        }

        const elapsed = timestamp - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)

        const currentValue = startValueRef.current + (value - startValueRef.current) * easeOutCubic
        setDisplayValue(currentValue)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animateCounter)
        }
      },
      [displayValue, duration, value]
    )

    // Intersection Observer for triggering animation when visible
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      const currentRef = counterRef.current
      if (currentRef) {
        observer.observe(currentRef)
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef)
        }
      }
    }, [isVisible])

    // Start animation when visible and value changes
    React.useEffect(() => {
      if (isVisible) {
        startTimeRef.current = undefined
        frameRef.current = requestAnimationFrame(animateCounter)
      }

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current)
        }
      }
    }, [isVisible, value, animateCounter])

    return (
      <span
        ref={counterRef}
        className={cn('tabular-nums transition-colors duration-200', className)}
        {...props}
      >
        {prefix}
        {formatValue(displayValue)}
        {suffix}
      </span>
    )
  }
)

AnimatedCounter.displayName = 'AnimatedCounter'

export { AnimatedCounter }
