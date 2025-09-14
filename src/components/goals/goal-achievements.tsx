'use client'

import { useState } from 'react'
import {
  Trophy,
  Star,
  Flame,
  Target,
  TrendingUp,
  Award,
  Medal,
  Crown,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import type { GoalWithProgress } from '@/lib/validations/goal'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  type: 'progress' | 'streak' | 'milestone' | 'speed' | 'consistency'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  requirement: number
  current?: number
  isUnlocked: boolean
  unlockedAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
}

interface GoalAchievementsProps {
  goals: GoalWithProgress[]
}

// Achievement icons mapping (for future use)
// const achievementIcons = {
//   Trophy,
//   Star,
//   Flame,
//   Target,
//   TrendingUp,
//   Award,
//   Medal,
//   Crown,
//   Zap,
//   Sparkles,
// }

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-400 to-slate-600', 
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
}

const rarityColors = {
  common: 'border-gray-200 bg-gray-50',
  rare: 'border-blue-200 bg-blue-50',
  epic: 'border-purple-200 bg-purple-50',
  legendary: 'border-yellow-200 bg-yellow-50 shadow-lg',
}

export function GoalAchievements({ goals }: GoalAchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null)

  // Calculate achievement progress
  const achievements = calculateAchievements(goals)
  const unlockedAchievements = achievements.filter(a => a.isUnlocked)
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)

  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.isUnlocked) {
      setSelectedAchievement(achievement)
    }
  }

  // Celebration function would be called when achievements are unlocked
  // const triggerCelebration = (achievement: Achievement) => {
  //   setShowCelebration(achievement)
  //   setTimeout(() => setShowCelebration(null), 3000)
  // }

  return (
    <div className="space-y-6">
      {/* Achievement Stats Header */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Achievement Center</h3>
                <p className="text-sm text-gray-600">Unlock rewards by reaching your goals</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Achievement Points</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{unlockedAchievements.length}</div>
              <div className="text-xs text-gray-600">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{achievements.length - unlockedAchievements.length}</div>
              <div className="text-xs text-gray-600">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => handleAchievementClick(achievement)}
          />
        ))}
      </div>

      {/* Recent Unlocks */}
      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlockedAchievements
                .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
                .slice(0, 3)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-100"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierColors[achievement.tier]} flex items-center justify-center`}>
                      <achievement.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">
                        {achievement.unlockedAt && format(achievement.unlockedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={`${tierColors[achievement.tier]} border-0 text-white`}>
                      +{achievement.points}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Detail Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedAchievement && (
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${tierColors[selectedAchievement.tier]} flex items-center justify-center`}>
                <selectedAchievement.icon className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {selectedAchievement.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  {selectedAchievement.description}
                </DialogDescription>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Badge className={`${tierColors[selectedAchievement.tier]} border-0 text-white px-3 py-1`}>
                  {selectedAchievement.tier.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {selectedAchievement.rarity.toUpperCase()}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Achievement Points</span>
                  <span className="font-bold text-purple-600">+{selectedAchievement.points}</span>
                </div>
                {selectedAchievement.unlockedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unlocked</span>
                    <span className="font-medium">
                      {format(selectedAchievement.unlockedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${tierColors[showCelebration.tier]} flex items-center justify-center shadow-2xl`}
              >
                <showCelebration.icon className="w-16 h-16 text-white" />
              </motion.div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Achievement Unlocked! 🎉
                </h2>
                <p className="text-lg font-semibold text-purple-600">
                  {showCelebration.title}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  +{showCelebration.points} points
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AchievementCard({ 
  achievement, 
  onClick 
}: { 
  achievement: Achievement
  onClick: () => void 
}) {
  const progressPercentage = achievement.current 
    ? Math.min((achievement.current / achievement.requirement) * 100, 100)
    : 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200',
        achievement.isUnlocked
          ? `${rarityColors[achievement.rarity]} shadow-md hover:shadow-lg`
          : 'border-gray-200 bg-gray-50/50 opacity-60',
        achievement.rarity === 'legendary' && achievement.isUnlocked && 'animate-pulse'
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Achievement Icon & Status */}
        <div className="flex items-center justify-between">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            achievement.isUnlocked
              ? `bg-gradient-to-br ${tierColors[achievement.tier]} shadow-md`
              : 'bg-gray-200'
          )}>
            {achievement.isUnlocked ? (
              <achievement.icon className="w-6 h-6 text-white" />
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          {achievement.isUnlocked && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </div>

        {/* Achievement Info */}
        <div className="space-y-1">
          <h3 className={cn(
            'font-semibold text-sm leading-tight',
            achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'
          )}>
            {achievement.title}
          </h3>
          <p className={cn(
            'text-xs leading-relaxed',
            achievement.isUnlocked ? 'text-gray-600' : 'text-gray-400'
          )}>
            {achievement.description}
          </p>
        </div>

        {/* Progress Bar */}
        {!achievement.isUnlocked && achievement.current !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                {achievement.current}/{achievement.requirement}
              </span>
              <span className="text-gray-500">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Tier & Points */}
        <div className="flex items-center justify-between pt-1">
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs px-2 py-0.5',
              achievement.isUnlocked 
                ? `border-${achievement.tier === 'gold' ? 'yellow' : achievement.tier === 'platinum' ? 'purple' : achievement.tier === 'silver' ? 'slate' : 'amber'}-300`
                : 'border-gray-300 text-gray-400'
            )}
          >
            {achievement.tier}
          </Badge>
          <span className={cn(
            'text-xs font-medium',
            achievement.isUnlocked ? 'text-purple-600' : 'text-gray-400'
          )}>
            {achievement.points}pts
          </span>
        </div>
      </div>

      {/* Rarity Glow Effect */}
      {achievement.isUnlocked && achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse" />
      )}
    </motion.div>
  )
}

function calculateAchievements(goals: GoalWithProgress[]): Achievement[] {
  const completedGoals = goals.filter(g => g.status === 'completed')
  const totalGoals = goals.length

  return [
    // Progress-based achievements
    {
      id: 'first-goal',
      title: 'Getting Started',
      description: 'Create your first saving goal',
      icon: Target,
      type: 'milestone',
      tier: 'bronze',
      requirement: 1,
      current: totalGoals,
      isUnlocked: totalGoals >= 1,
      unlockedAt: totalGoals >= 1 ? new Date() : undefined,
      rarity: 'common',
      points: 10,
    },
    {
      id: 'goal-master',
      title: 'Goal Master',
      description: 'Create 5 different saving goals',
      icon: Trophy,
      type: 'milestone',
      tier: 'silver',
      requirement: 5,
      current: totalGoals,
      isUnlocked: totalGoals >= 5,
      unlockedAt: totalGoals >= 5 ? new Date() : undefined,
      rarity: 'rare',
      points: 50,
    },
    {
      id: 'first-complete',
      title: 'Mission Accomplished',
      description: 'Complete your first saving goal',
      icon: CheckCircle2,
      type: 'milestone',
      tier: 'gold',
      requirement: 1,
      current: completedGoals.length,
      isUnlocked: completedGoals.length >= 1,
      unlockedAt: completedGoals.length >= 1 ? new Date() : undefined,
      rarity: 'epic',
      points: 100,
    },
    {
      id: 'hat-trick',
      title: 'Hat Trick',
      description: 'Complete 3 saving goals',
      icon: Medal,
      type: 'milestone',
      tier: 'gold',
      requirement: 3,
      current: completedGoals.length,
      isUnlocked: completedGoals.length >= 3,
      unlockedAt: completedGoals.length >= 3 ? new Date() : undefined,
      rarity: 'epic',
      points: 200,
    },
    {
      id: 'savings-legend',
      title: 'Savings Legend',
      description: 'Complete 10 saving goals',
      icon: Crown,
      type: 'milestone',
      tier: 'platinum',
      requirement: 10,
      current: completedGoals.length,
      isUnlocked: completedGoals.length >= 10,
      unlockedAt: completedGoals.length >= 10 ? new Date() : undefined,
      rarity: 'legendary',
      points: 500,
    },
    // Progress-based achievements
    {
      id: 'halfway-there',
      title: 'Halfway There',
      description: 'Reach 50% on any goal',
      icon: TrendingUp,
      type: 'progress',
      tier: 'bronze',
      requirement: 50,
      current: Math.max(...goals.map(g => g.progress_percentage), 0),
      isUnlocked: goals.some(g => g.progress_percentage >= 50),
      unlockedAt: goals.some(g => g.progress_percentage >= 50) ? new Date() : undefined,
      rarity: 'common',
      points: 25,
    },
    {
      id: 'almost-there',
      title: 'Almost There',
      description: 'Reach 90% on any goal',
      icon: Star,
      type: 'progress',
      tier: 'silver',
      requirement: 90,
      current: Math.max(...goals.map(g => g.progress_percentage), 0),
      isUnlocked: goals.some(g => g.progress_percentage >= 90),
      unlockedAt: goals.some(g => g.progress_percentage >= 90) ? new Date() : undefined,
      rarity: 'rare',
      points: 75,
    },
    // Note: Streak achievements disabled until contribution history is tracked
    // Speed achievements based on actual goal completion times
    {
      id: 'speed-saver',
      title: 'Speed Saver',
      description: 'Complete a goal in under 30 days',
      icon: Sparkles,
      type: 'speed',
      tier: 'gold',
      requirement: 30,
      current: completedGoals.length > 0 ? Math.min(
        ...completedGoals.map(g => 
          differenceInDays(new Date(), new Date(g.created_at))
        )
      ) : undefined,
      isUnlocked: completedGoals.some(g => 
        differenceInDays(new Date(), new Date(g.created_at)) <= 30
      ),
      unlockedAt: completedGoals.some(g => 
        differenceInDays(new Date(), new Date(g.created_at)) <= 30
      ) ? new Date() : undefined,
      rarity: 'epic',
      points: 250,
    },
  ]
}

// Streak calculation removed - would require contribution history tracking
// This feature would need additional database tables to track daily contributions