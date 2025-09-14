// ==================================================
// ACHIEVEMENT BADGE COMPONENT
// Premium badge component for displaying achievements
// ==================================================

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'
import type { Achievement, UserAchievement } from '@/types/gamification'

interface AchievementBadgeProps {
  achievement: Achievement | UserAchievement
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTitle?: boolean
  showDescription?: boolean
  showPoints?: boolean
  earned?: boolean
  animate?: boolean
  onClick?: () => void
  className?: string
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showTitle = true,
  showDescription = false,
  showPoints = false,
  earned = true,
  animate = true,
  onClick,
  className
}: AchievementBadgeProps) {
  // Get achievement details
  const achievementDetails = 'achievement_id' in achievement 
    ? ACHIEVEMENTS[achievement.achievement_id] 
    : achievement

  if (!achievementDetails) {
    return null
  }

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'text-lg h-8 w-8',
      title: 'text-xs',
      description: 'text-xs',
      points: 'text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'text-xl h-12 w-12',
      title: 'text-sm',
      description: 'text-xs',
      points: 'text-xs'
    },
    lg: {
      container: 'p-6',
      icon: 'text-2xl h-16 w-16',
      title: 'text-base',
      description: 'text-sm',
      points: 'text-sm'
    },
    xl: {
      container: 'p-8',
      icon: 'text-3xl h-20 w-20',
      title: 'text-lg',
      description: 'text-base',
      points: 'text-base'
    }
  }

  const rarityStyles = {
    common: {
      gradient: 'from-gray-400 to-gray-500',
      glow: 'shadow-gray-500/20',
      border: 'border-gray-300',
      bg: 'bg-gray-50'
    },
    uncommon: {
      gradient: 'from-green-400 to-green-600',
      glow: 'shadow-green-500/30',
      border: 'border-green-300',
      bg: 'bg-green-50'
    },
    rare: {
      gradient: 'from-blue-400 to-blue-600',
      glow: 'shadow-blue-500/30',
      border: 'border-blue-300',
      bg: 'bg-blue-50'
    },
    epic: {
      gradient: 'from-purple-400 to-purple-600',
      glow: 'shadow-purple-500/30',
      border: 'border-purple-300',
      bg: 'bg-purple-50'
    },
    legendary: {
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      glow: 'shadow-orange-500/40',
      border: 'border-orange-300',
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50'
    }
  }

  const rarity = rarityStyles[achievementDetails.rarity] || rarityStyles.common
  const sizes = sizeClasses[size]

  const MotionDiv = animate ? motion.div : 'div'

  const badgeContent = (
    <MotionDiv
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 transition-all duration-300',
        rarity.border,
        rarity.bg,
        earned 
          ? `cursor-pointer hover:scale-105 hover:shadow-lg ${rarity.glow}` 
          : 'opacity-50 grayscale cursor-default',
        onClick && 'cursor-pointer',
        sizes.container,
        className
      )}
      onClick={onClick}
      {...(animate && {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        whileHover: earned ? { scale: 1.05 } : undefined,
        whileTap: earned ? { scale: 0.98 } : undefined,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      })}
    >
      {/* Gradient overlay for legendary items */}
      {achievementDetails.rarity === 'legendary' && earned && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse" />
      )}

      {/* Icon container */}
      <div className="relative flex flex-col items-center space-y-2">
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full border-2 border-white/50 shadow-inner transition-all duration-300',
            `bg-gradient-to-br ${rarity.gradient}`,
            sizes.icon,
            earned && 'group-hover:shadow-lg group-hover:scale-110'
          )}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Achievement icon */}
          <span className={cn('relative z-10 font-bold text-white', sizes.icon)}>
            {achievementDetails.icon}
          </span>

          {/* Sparkle effect for high rarity */}
          {(achievementDetails.rarity === 'epic' || achievementDetails.rarity === 'legendary') && earned && (
            <>
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white animate-ping" />
              <div className="absolute -bottom-1 -left-1 h-1.5 w-1.5 rounded-full bg-white animate-ping delay-300" />
            </>
          )}
        </div>

        {/* Achievement details */}
        <div className="flex flex-col items-center space-y-1 text-center">
          {showTitle && (
            <h3 className={cn(
              'font-bold text-gray-900',
              sizes.title,
              !earned && 'text-gray-400'
            )}>
              {achievementDetails.title}
            </h3>
          )}

          {showDescription && (
            <p className={cn(
              'text-gray-600 max-w-xs',
              sizes.description,
              !earned && 'text-gray-400'
            )}>
              {achievementDetails.description}
            </p>
          )}

          {showPoints && (
            <div className={cn(
              'inline-flex items-center rounded-full px-2 py-1 font-medium',
              `bg-gradient-to-r ${rarity.gradient} text-white shadow-sm`,
              sizes.points,
              !earned && 'opacity-50'
            )}>
              ⭐ {achievementDetails.points} pts
            </div>
          )}
        </div>
      </div>

      {/* Earned date for earned achievements */}
      {'earned_at' in achievement && achievement.earned_at && (
        <div className="absolute top-2 right-2">
          <div className="rounded-full bg-green-500 p-1">
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </MotionDiv>
  )

  return badgeContent
}

// ==================================================
// ACHIEVEMENT GRID COMPONENT
// ==================================================

interface AchievementGridProps {
  achievements: (Achievement | UserAchievement)[]
  earnedAchievements?: UserAchievement[]
  columns?: 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  onAchievementClick?: (achievement: Achievement | UserAchievement) => void
  className?: string
}

export function AchievementGrid({
  achievements,
  earnedAchievements = [],
  columns = 4,
  size = 'md',
  showDetails = false,
  onAchievementClick,
  className
}: AchievementGridProps) {
  const earnedIds = new Set(earnedAchievements.map(a => a.achievement_id))

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
  }

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {achievements.map((achievement, index) => {
        const achievementId = 'achievement_id' in achievement 
          ? achievement.achievement_id 
          : achievement.id
        const isEarned = earnedIds.has(achievementId)

        return (
          <motion.div
            key={achievementId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementBadge
              achievement={achievement}
              size={size}
              showTitle
              showDescription={showDetails}
              showPoints={showDetails}
              earned={isEarned}
              onClick={() => onAchievementClick?.(achievement)}
            />
          </motion.div>
        )
      })}
    </div>
  )
}