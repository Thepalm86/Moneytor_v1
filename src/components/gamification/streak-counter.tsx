// ==================================================
// STREAK COUNTER COMPONENT
// Visual streak tracking with fire animations
// ==================================================

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { StatType } from '@/types/gamification'

interface StreakCounterProps {
  streakType: StatType
  currentStreak: number
  bestStreak: number
  title?: string
  description?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  showBest?: boolean
  animate?: boolean
  className?: string
}

export function StreakCounter({
  streakType,
  currentStreak,
  bestStreak,
  title,
  description,
  icon,
  size = 'md',
  showBest = true,
  animate = true,
  className
}: StreakCounterProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      counter: 'text-lg',
      title: 'text-sm',
      description: 'text-xs',
      icon: 'h-5 w-5',
      flame: 'h-4 w-4'
    },
    md: {
      container: 'p-4',
      counter: 'text-2xl',
      title: 'text-base',
      description: 'text-sm',
      icon: 'h-6 w-6',
      flame: 'h-5 w-5'
    },
    lg: {
      container: 'p-6',
      counter: 'text-3xl',
      title: 'text-lg',
      description: 'text-base',
      icon: 'h-8 w-8',
      flame: 'h-6 w-6'
    }
  }

  const sizes = sizeClasses[size]

  // Get streak-specific styling
  const getStreakStyling = (streak: number) => {
    if (streak >= 30) {
      return {
        color: 'text-orange-600',
        bg: 'bg-gradient-to-br from-orange-50 to-red-50',
        border: 'border-orange-200',
        intensity: 'legendary'
      }
    } else if (streak >= 14) {
      return {
        color: 'text-red-600',
        bg: 'bg-gradient-to-br from-red-50 to-orange-50',
        border: 'border-red-200',
        intensity: 'epic'
      }
    } else if (streak >= 7) {
      return {
        color: 'text-yellow-600',
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
        border: 'border-yellow-200',
        intensity: 'hot'
      }
    } else if (streak >= 3) {
      return {
        color: 'text-amber-600',
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        intensity: 'warm'
      }
    } else {
      return {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        intensity: 'cold'
      }
    }
  }

  const streakStyle = getStreakStyling(currentStreak)

  // Default icons for different streak types
  const defaultIcons = {
    transaction_streak: <Target className={sizes.icon} />,
    budget_streak: <TrendingUp className={sizes.icon} />,
    goal_streak: <Target className={sizes.icon} />,
    login_streak: <Calendar className={sizes.icon} />
  }

  const displayIcon = icon || defaultIcons[streakType] || <Flame className={sizes.icon} />

  // Default titles for streak types
  const defaultTitles = {
    transaction_streak: 'Transaction Streak',
    budget_streak: 'Budget Streak', 
    goal_streak: 'Savings Streak',
    login_streak: 'Login Streak'
  }

  const displayTitle = title || defaultTitles[streakType] || 'Streak'

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      streakStyle.bg,
      streakStyle.border,
      className
    )}>
      <CardHeader className={cn('pb-2', sizes.container)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn('text-gray-600', streakStyle.color)}>
              {displayIcon}
            </div>
            <h3 className={cn('font-semibold text-gray-900', sizes.title)}>
              {displayTitle}
            </h3>
          </div>
          
          {/* Fire indicator */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, Math.floor(currentStreak / 7) + 1) }).map((_, i) => (
              <motion.div
                key={i}
                animate={animate ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                } : undefined}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              >
                <Flame 
                  className={cn(
                    sizes.flame,
                    currentStreak >= (i + 1) * 7 
                      ? streakStyle.color 
                      : 'text-gray-300'
                  )}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className={sizes.container}>
        <div className="space-y-2">
          {/* Current streak */}
          <div className="flex items-baseline space-x-2">
            <motion.span
              className={cn(
                'font-bold',
                sizes.counter,
                streakStyle.color
              )}
              animate={animate && currentStreak > 0 ? {
                scale: [1, 1.05, 1]
              } : undefined}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              {currentStreak}
            </motion.span>
            <span className={cn('text-gray-500', sizes.description)}>
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Best streak */}
          {showBest && bestStreak > 0 && (
            <div className="flex items-center justify-between">
              <span className={cn('text-gray-500', sizes.description)}>
                Best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
              </span>
              {currentStreak === bestStreak && currentStreak > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  Personal Best! 🏆
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className={cn('text-gray-600', sizes.description)}>
              {description}
            </p>
          )}

          {/* Milestone indicators */}
          <StreakMilestones currentStreak={currentStreak} size={size} />
        </div>
      </CardContent>

      {/* Glow effect for hot streaks */}
      {currentStreak >= 7 && (
        <div className={cn(
          'absolute inset-0 opacity-20 blur-xl',
          streakStyle.bg
        )} />
      )}
    </Card>
  )
}

// ==================================================
// STREAK MILESTONES
// ==================================================

interface StreakMilestonesProps {
  currentStreak: number
  size: 'sm' | 'md' | 'lg'
}

function StreakMilestones({ currentStreak, size }: StreakMilestonesProps) {
  const milestones = [3, 7, 14, 30, 60, 100]
  const nextMilestone = milestones.find(m => m > currentStreak)

  if (!nextMilestone && currentStreak < 100) {
    return null
  }

  const progress = nextMilestone 
    ? (currentStreak / nextMilestone) * 100
    : 100

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5', 
    lg: 'h-2'
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Next milestone</span>
        {nextMilestone && (
          <span>{nextMilestone} days</span>
        )}
      </div>
      <div className={cn(
        'w-full rounded-full bg-gray-200',
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300',
            sizeClasses[size]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ==================================================
// STREAK GRID
// ==================================================

interface StreakGridProps {
  streaks: {
    type: StatType
    current: number
    best: number
    title?: string
    description?: string
    icon?: React.ReactNode
  }[]
  columns?: 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakGrid({ 
  streaks, 
  columns = 2, 
  size = 'md',
  className 
}: StreakGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {streaks.map((streak, index) => (
        <motion.div
          key={streak.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StreakCounter
            streakType={streak.type}
            currentStreak={streak.current}
            bestStreak={streak.best}
            title={streak.title}
            description={streak.description}
            icon={streak.icon}
            size={size}
          />
        </motion.div>
      ))}
    </div>
  )
}

// ==================================================
// STREAK SUMMARY
// ==================================================

interface StreakSummaryProps {
  totalStreaks: number
  activeStreaks: number
  longestStreak: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakSummary({
  totalStreaks,
  activeStreaks, 
  longestStreak,
  size = 'md',
  className
}: StreakSummaryProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      stat: 'text-lg',
      label: 'text-xs'
    },
    md: {
      container: 'p-4',
      stat: 'text-xl',
      label: 'text-sm'
    },
    lg: {
      container: 'p-6',
      stat: 'text-2xl',
      label: 'text-base'
    }
  }

  const sizes = sizeClasses[size]

  const stats = [
    {
      label: 'Total Streaks',
      value: totalStreaks,
      color: 'text-blue-600'
    },
    {
      label: 'Active Now',
      value: activeStreaks,
      color: 'text-green-600'
    },
    {
      label: 'Longest Ever',
      value: longestStreak,
      color: 'text-orange-600'
    }
  ]

  return (
    <Card className={cn('bg-gradient-to-br from-gray-50 to-white', className)}>
      <CardContent className={sizes.container}>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={cn('font-bold', sizes.stat, stat.color)}>
                {stat.value}
              </div>
              <div className={cn('text-gray-600', sizes.label)}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}