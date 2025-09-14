// ==================================================
// GAMIFICATION SHOWCASE COMPONENT
// Dashboard widget showing achievements and progress
// ==================================================

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AchievementBadge } from './achievement-badge'
import { StreakCounter } from './streak-counter'
import { ProgressRing } from './progress-ring'
import { CelebrationManager } from './celebration-modal'
import { useGamification, useAchievements, useStreaks } from '@/contexts/gamification-context'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'
import { cn } from '@/lib/utils'

interface GamificationShowcaseProps {
  className?: string
  showFullView?: boolean
}

export function GamificationShowcase({ 
  className, 
  showFullView = false 
}: GamificationShowcaseProps) {
  const { pendingCelebrations, dismissCelebration } = useGamification()
  const { achievements, earnedCount, totalCount, recentAchievements } = useAchievements()
  const { currentStreaks, getHighestStreak } = useStreaks()

  const completionPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0
  const highestStreak = getHighestStreak()

  if (showFullView) {
    return <GamificationFullView className={className} />
  }

  return (
    <>
      {/* Celebration Manager */}
      <CelebrationManager
        celebrations={pendingCelebrations}
        onDismiss={dismissCelebration}
      />

      {/* Compact Dashboard Widget */}
      <Card className={cn(
        'relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200/50',
        className
      )}>
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-100/20" />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Achievements</h3>
            </div>
            <Badge variant="secondary" className="bg-white/50">
              {earnedCount}/{totalCount}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Progress Ring */}
          <div className="flex items-center space-x-4">
            <ProgressRing
              progress={completionPercentage}
              size="sm"
              color="gradient"
              showValue
            />
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Achievement Progress
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              
              {highestStreak > 0 && (
                <div className="flex items-center space-x-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-600">
                    {highestStreak} day streak
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700">Recent Achievements</h4>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {recentAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex-shrink-0">
                    <AchievementBadge
                      achievement={achievement}
                      size="sm"
                      showTitle={false}
                      showDescription={false}
                      earned
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-between text-purple-700 hover:bg-purple-100/50"
          >
            <span>View All Achievements</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

// ==================================================
// FULL VIEW COMPONENT
// ==================================================

function GamificationFullView({ className }: { className?: string }) {
  const { achievements, earnedCount, totalCount } = useAchievements()
  const { currentStreaks, bestStreaks } = useStreaks()

  const streakData = Object.entries(currentStreaks).map(([type, current]) => ({
    type: type as any,
    current,
    best: bestStreaks[type as keyof typeof bestStreaks] || 0
  }))

  const achievementsByType = {
    milestone: achievements.filter(a => a.achievement_type === 'milestone'),
    streak: achievements.filter(a => a.achievement_type === 'streak'), 
    learning: achievements.filter(a => a.achievement_type === 'learning'),
    premium: achievements.filter(a => a.achievement_type === 'premium')
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Achievements"
          value={earnedCount}
          total={totalCount}
          icon={<Trophy className="h-5 w-5" />}
          color="bg-gradient-to-br from-yellow-400 to-orange-500"
        />
        <StatCard
          title="Active Streaks"
          value={Object.values(currentStreaks).filter(s => s > 0).length}
          icon={<Flame className="h-5 w-5" />}
          color="bg-gradient-to-br from-orange-400 to-red-500"
        />
        <StatCard
          title="Completion Rate"
          value={Math.round((earnedCount / totalCount) * 100)}
          suffix="%"
          icon={<Star className="h-5 w-5" />}
          color="bg-gradient-to-br from-purple-400 to-pink-500"
        />
        <StatCard
          title="Best Streak"
          value={Math.max(...Object.values(bestStreaks))}
          suffix=" days"
          icon={<Flame className="h-5 w-5" />}
          color="bg-gradient-to-br from-blue-400 to-indigo-500"
        />
      </div>

      {/* Achievements by Category */}
      <div className="space-y-6">
        {Object.entries(achievementsByType).map(([type, userAchievements]) => (
          <div key={type}>
            <h3 className="mb-4 text-lg font-semibold capitalize text-gray-900">
              {type} Achievements
            </h3>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.values(ACHIEVEMENTS)
                .filter(a => a.type === type)
                .map(achievement => {
                  const earned = userAchievements.some(ua => ua.achievement_id === achievement.id)
                  return (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="md"
                      showDescription
                      showPoints
                      earned={earned}
                    />
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Streaks Section */}
      {streakData.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Current Streaks
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {streakData.map(streak => (
              <StreakCounter
                key={streak.type}
                streakType={streak.type}
                currentStreak={streak.current}
                bestStreak={streak.best}
                size="md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==================================================
// STAT CARD COMPONENT
// ==================================================

interface StatCardProps {
  title: string
  value: number
  total?: number
  suffix?: string
  icon: React.ReactNode
  color: string
  className?: string
}

function StatCard({ 
  title, 
  value, 
  total, 
  suffix = '', 
  icon, 
  color, 
  className 
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
              {total && <span className="text-sm text-gray-500">/{total}</span>}
              {suffix}
            </p>
          </div>
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg',
            color
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================================================
// GAMIFICATION STATUS INDICATOR
// ==================================================

export function GamificationStatusIndicator() {
  const { isLoading, error } = useGamification()
  const { earnedCount } = useAchievements()
  const { getHighestStreak } = useStreaks()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <span>Loading achievements...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-xs text-red-500">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <span>Achievement system offline</span>
      </div>
    )
  }

  const highestStreak = getHighestStreak()

  return (
    <div className="flex items-center space-x-3 text-xs">
      {earnedCount > 0 && (
        <div className="flex items-center space-x-1 text-yellow-600">
          <Trophy className="h-3 w-3" />
          <span>{earnedCount}</span>
        </div>
      )}
      {highestStreak > 0 && (
        <div className="flex items-center space-x-1 text-orange-600">
          <Flame className="h-3 w-3" />
          <span>{highestStreak}</span>
        </div>
      )}
    </div>
  )
}