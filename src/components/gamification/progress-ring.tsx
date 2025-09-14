// ==================================================
// PROGRESS RING COMPONENT
// Circular progress indicator for goals and achievements
// ==================================================

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl'
  thickness?: 'thin' | 'medium' | 'thick'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient'
  showValue?: boolean
  label?: string
  animate?: boolean
  children?: React.ReactNode
  className?: string
}

export function ProgressRing({
  progress,
  size = 'md',
  thickness = 'medium',
  color = 'primary',
  showValue = true,
  label,
  animate = true,
  children,
  className
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  
  const sizeClasses = {
    sm: { 
      container: 'h-16 w-16', 
      text: 'text-xs', 
      label: 'text-xs',
      svg: 'h-16 w-16'
    },
    md: { 
      container: 'h-24 w-24', 
      text: 'text-sm', 
      label: 'text-sm',
      svg: 'h-24 w-24'
    },
    lg: { 
      container: 'h-32 w-32', 
      text: 'text-base', 
      label: 'text-base',
      svg: 'h-32 w-32'
    },
    xl: { 
      container: 'h-40 w-40', 
      text: 'text-lg', 
      label: 'text-lg',
      svg: 'h-40 w-40'
    }
  }

  const thicknessMap = {
    thin: 2,
    medium: 4,
    thick: 6
  }

  const colorClasses = {
    primary: {
      background: 'stroke-primary-200',
      progress: 'stroke-primary-500',
      text: 'text-primary-700'
    },
    secondary: {
      background: 'stroke-gray-200',
      progress: 'stroke-gray-500',
      text: 'text-gray-700'
    },
    success: {
      background: 'stroke-green-200',
      progress: 'stroke-green-500',
      text: 'text-green-700'
    },
    warning: {
      background: 'stroke-amber-200',
      progress: 'stroke-amber-500',
      text: 'text-amber-700'
    },
    error: {
      background: 'stroke-red-200',
      progress: 'stroke-red-500',
      text: 'text-red-700'
    },
    gradient: {
      background: 'stroke-gray-200',
      progress: 'stroke-url(#gradient)',
      text: 'text-gray-700'
    }
  }

  const sizes = sizeClasses[size]
  const strokeWidth = thicknessMap[thickness]
  const colors = colorClasses[color]
  
  // SVG circle properties
  const radius = 40 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedProgress / 100) * circumference

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div className={cn('relative', sizes.container)}>
        <svg 
          className={cn(sizes.svg, 'transform -rotate-90')}
          viewBox="0 0 80 80"
        >
          {/* Gradient definition for gradient color option */}
          {color === 'gradient' && (
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06d6a0" />
              </linearGradient>
            </defs>
          )}

          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={colors.background}
          />

          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colors.progress}
            style={{
              strokeDasharray: circumference,
            }}
            initial={animate ? { strokeDashoffset: circumference } : undefined}
            animate={{ strokeDashoffset: offset }}
            transition={animate ? { duration: 1, ease: "easeOut" } : undefined}
          />
        </svg>

        {/* Content inside the ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children || (
            <>
              {showValue && (
                <span className={cn('font-bold', sizes.text, colors.text)}>
                  {Math.round(clampedProgress)}%
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Label below the ring */}
      {label && (
        <span className={cn('mt-2 text-center font-medium text-gray-600', sizes.label)}>
          {label}
        </span>
      )}
    </div>
  )
}

// ==================================================
// ANIMATED PROGRESS RING
// ==================================================

interface AnimatedProgressRingProps extends ProgressRingProps {
  targetProgress: number
  duration?: number
  onComplete?: () => void
}

export function AnimatedProgressRing({
  targetProgress,
  duration = 2000,
  onComplete,
  ...props
}: AnimatedProgressRingProps) {
  const [currentProgress, setCurrentProgress] = React.useState(0)

  React.useEffect(() => {
    const startTime = Date.now()
    const initialProgress = currentProgress

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3)
      const newProgress = initialProgress + (targetProgress - initialProgress) * easedProgress

      setCurrentProgress(newProgress)

      if (progressRatio < 1) {
        requestAnimationFrame(updateProgress)
      } else {
        setCurrentProgress(targetProgress)
        onComplete?.()
      }
    }

    requestAnimationFrame(updateProgress)
  }, [targetProgress, duration, currentProgress, onComplete])

  return <ProgressRing {...props} progress={currentProgress} animate={false} />
}

// ==================================================
// MULTIPLE PROGRESS RINGS
// ==================================================

interface MultiProgressRingProps {
  rings: {
    progress: number
    color: ProgressRingProps['color']
    label?: string
    thickness?: ProgressRingProps['thickness']
  }[]
  size?: ProgressRingProps['size']
  spacing?: 'tight' | 'normal' | 'loose'
  animate?: boolean
  children?: React.ReactNode
  className?: string
}

export function MultiProgressRing({
  rings,
  size = 'md',
  spacing = 'normal',
  animate = true,
  children,
  className
}: MultiProgressRingProps) {
  const spacingMap = {
    tight: 2,
    normal: 4,
    loose: 6
  }

  const sizeMap = {
    sm: { outer: 20, base: 16 },
    md: { outer: 32, base: 24 },
    lg: { outer: 40, base: 32 },
    xl: { outer: 48, base: 40 }
  }

  const dimensions = sizeMap[size]
  const gap = spacingMap[spacing]

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <div className="relative" style={{ 
        width: dimensions.outer + (rings.length - 1) * gap,
        height: dimensions.outer + (rings.length - 1) * gap 
      }}>
        {rings.map((ring, index) => {
          const offset = index * gap
          const ringSize = dimensions.base + offset * 2
          
          return (
            <div
              key={index}
              className="absolute"
              style={{
                top: offset,
                left: offset,
                width: ringSize,
                height: ringSize
              }}
            >
              <ProgressRing
                progress={ring.progress}
                size={size}
                thickness={ring.thickness || 'thin'}
                color={ring.color}
                showValue={false}
                animate={animate}
              />
            </div>
          )
        })}

        {/* Content in the center */}
        {children && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        )}
      </div>

      {/* Labels */}
      {rings.some(ring => ring.label) && (
        <div className="ml-4 space-y-1">
          {rings.map((ring, index) => (
            ring.label && (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: `var(--${ring.color}-500)` }}
                />
                <span>{ring.label}: {Math.round(ring.progress)}%</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}