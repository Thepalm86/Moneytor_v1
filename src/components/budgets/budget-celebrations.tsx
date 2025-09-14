'use client'

import { useState } from 'react'
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Award,
  Crown,
  Medal,
  CheckCircle,
  Gift,
  Sparkles,
  DollarSign
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BudgetWithStats } from '@/lib/validations/budget'

interface BudgetCelebrationsProps {
  budgets: BudgetWithStats[]
  achievements?: BudgetAchievement[]
  streaks?: BudgetStreak[]
  onCelebrate?: (achievement: BudgetAchievement) => void
}

interface BudgetAchievement {
  id: string
  type: 'budget_goal' | 'streak' | 'savings' | 'milestone' | 'improvement'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  reward?: string
}

interface BudgetStreak {
  id: string
  budgetId: string
  streakCount: number
  streakType: 'under_budget' | 'on_track' | 'savings_goal'
  startDate: Date
  lastUpdated: Date
}

interface Confetti {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocity: { x: number; y: number }
  life: number
}

export function BudgetCelebrations({ 
  budgets, 
  achievements = [], 
  streaks = [],
  onCelebrate 
}: BudgetCelebrationsProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<BudgetAchievement | null>(null)
  const [confetti, setConfetti] = useState<Confetti[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  // Generate achievements from budget data
  const { unlocked: generatedUnlocked, available: generatedAvailable } = generateAchievements(budgets, streaks)
  const unlockedAchievements = [...(achievements.filter(a => a.unlockedAt)), ...generatedUnlocked]
  const availableAchievements = [...(achievements.filter(a => !a.unlockedAt)), ...generatedAvailable]

  const handleCelebrate = (achievement: BudgetAchievement) => {
    setCurrentAchievement(achievement)
    setShowCelebration(true)
    triggerConfetti()
    onCelebrate?.(achievement)
  }

  const triggerConfetti = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
    const newConfetti: Confetti[] = []
    
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        },
        life: 100
      })
    }
    
    setConfetti(newConfetti)
    setShowConfetti(true)
    
    // Animate confetti
    const animateConfetti = () => {
      setConfetti(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.velocity.x,
        y: particle.y + particle.velocity.y,
        life: particle.life - 1
      })).filter(particle => particle.life > 0))
    }
    
    const interval = setInterval(() => {
      animateConfetti()
      setConfetti(prev => {
        if (prev.length === 0) {
          clearInterval(interval)
          setShowConfetti(false)
          return []
        }
        return prev
      })
    }, 50)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)
  const level = Math.floor(totalPoints / 100) + 1
  const pointsToNextLevel = (level * 100) - totalPoints

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.life / 100
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Budget Achievements</h2>
            <p className="text-sm text-gray-600">Celebrate your financial wins and milestones</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Level {level}</span>
          </div>
          <p className="text-xs text-gray-600">{totalPoints} points</p>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="glass-card bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-800">Progress to Level {level + 1}</span>
            <span className="text-sm text-yellow-700">{pointsToNextLevel} points to go</span>
          </div>
          <Progress 
            value={(totalPoints % 100)} 
            className="h-2 bg-yellow-200"
          />
        </CardContent>
      </Card>

      {/* Active Streaks */}
      {streaks.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Active Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {streaks.slice(0, 4).map((streak) => {
                const budget = budgets.find(b => b.id === streak.budgetId)
                return (
                  <div key={streak.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                      <Flame className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">
                        {budget?.category?.name || 'Unknown Budget'}
                      </p>
                      <p className="text-xs text-orange-700">
                        {streak.streakCount} {streak.streakType.replace('_', ' ')} streak
                      </p>
                    </div>
                    <Badge className="bg-orange-200 text-orange-800">
                      {streak.streakCount}🔥
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-500" />
            Recent Achievements ({unlockedAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unlockedAchievements.length > 0 ? (
            <div className="space-y-3">
              {unlockedAchievements.slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                    <achievement.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-blue-900">{achievement.title}</p>
                      <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700 mb-1">{achievement.description}</p>
                    <div className="flex items-center gap-3 text-xs text-blue-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {achievement.points} points
                      </span>
                      {achievement.unlockedAt && (
                        <span>{achievement.unlockedAt.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCelebrate(achievement)}
                    className="text-xs"
                  >
                    🎉
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No achievements yet</p>
              <p className="text-xs text-gray-500">Start budgeting to earn your first achievement!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Achievements */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            Available Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableAchievements.slice(0, 6).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-75">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200">
                  <achievement.icon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{achievement.title}</p>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="mt-1">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1"
                      />
                      <span className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {achievement.points}pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Achievement Unlocked!
            </DialogTitle>
          </DialogHeader>
          
          {currentAchievement && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mx-auto">
                <currentAchievement.icon className="h-10 w-10 text-yellow-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {currentAchievement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {currentAchievement.description}
                </p>
                
                <div className="flex items-center justify-center gap-4 text-sm">
                  <Badge className={getRarityColor(currentAchievement.rarity)}>
                    {currentAchievement.rarity.toUpperCase()}
                  </Badge>
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {currentAchievement.points} points
                  </span>
                </div>

                {currentAchievement.reward && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎁 Reward: {currentAchievement.reward}
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={() => setShowCelebration(false)} className="w-full">
                Awesome! 🎉
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function generateAchievements(budgets: BudgetWithStats[], streaks: BudgetStreak[]): { unlocked: BudgetAchievement[], available: BudgetAchievement[] } {
  const unlocked: BudgetAchievement[] = []
  const available: BudgetAchievement[] = []

  const underBudgetCount = budgets.filter(b => !b.is_over_budget && b.spent_amount > 0).length
  const totalSavings = budgets.reduce((sum, b) => sum + Math.max(0, b.remaining_amount), 0)
  const longestStreak = Math.max(0, ...streaks.map(s => s.streakCount))

  // First Budget Achievement
  if (budgets.length >= 1) {
    unlocked.push({
      id: 'first-budget',
      type: 'milestone',
      title: 'Budget Beginner',
      description: 'Created your first budget',
      icon: Target,
      rarity: 'common',
      points: 25,
      unlockedAt: new Date() // This should be when they actually created their first budget
    })
  } else {
    available.push({
      id: 'first-budget',
      type: 'milestone',
      title: 'Budget Beginner',
      description: 'Create your first budget',
      icon: Target,
      rarity: 'common',
      points: 25,
      progress: budgets.length,
      maxProgress: 1
    })
  }

  // Multiple Budgets Achievement
  if (budgets.length >= 5) {
    unlocked.push({
      id: 'budget-master',
      type: 'milestone',
      title: 'Budget Master',
      description: 'Managing 5 or more budgets',
      icon: Crown,
      rarity: 'rare',
      points: 100,
      unlockedAt: new Date()
    })
  } else {
    available.push({
      id: 'budget-master',
      type: 'milestone',
      title: 'Budget Master',
      description: 'Manage 5 or more budgets',
      icon: Crown,
      rarity: 'rare',
      points: 100,
      progress: budgets.length,
      maxProgress: 5
    })
  }

  // Under Budget Hero
  if (underBudgetCount >= 3) {
    unlocked.push({
      id: 'under-budget-hero',
      type: 'budget_goal',
      title: 'Under Budget Hero',
      description: 'Stayed under budget for 3+ categories',
      icon: CheckCircle,
      rarity: 'rare',
      points: 75,
      unlockedAt: new Date()
    })
  } else {
    available.push({
      id: 'under-budget-hero',
      type: 'budget_goal',
      title: 'Under Budget Hero',
      description: 'Stay under budget for 3 categories',
      icon: CheckCircle,
      rarity: 'rare',
      points: 75,
      progress: underBudgetCount,
      maxProgress: 3
    })
  }

  // Savings Champion
  if (totalSavings >= 500) {
    unlocked.push({
      id: 'savings-champion',
      type: 'savings',
      title: 'Savings Champion',
      description: `Saved $${totalSavings.toFixed(0)} across all budgets`,
      icon: DollarSign,
      rarity: 'epic',
      points: 150,
      unlockedAt: new Date()
    })
  } else {
    available.push({
      id: 'savings-champion',
      type: 'savings',
      title: 'Savings Champion',
      description: 'Save $500 across all budgets',
      icon: DollarSign,
      rarity: 'epic',
      points: 150,
      progress: totalSavings,
      maxProgress: 500
    })
  }

  // Streak Master (only if there are actual streaks)
  if (longestStreak >= 7) {
    unlocked.push({
      id: 'streak-master',
      type: 'streak',
      title: 'Streak Master',
      description: `${longestStreak} day budget streak`,
      icon: Flame,
      rarity: 'epic',
      points: 200,
      unlockedAt: new Date()
    })
  } else if (streaks.length > 0) {
    available.push({
      id: 'streak-master',
      type: 'streak',
      title: 'Streak Master',
      description: 'Maintain a 7-day budget streak',
      icon: Flame,
      rarity: 'epic',
      points: 200,
      progress: longestStreak,
      maxProgress: 7
    })
  }

  // Always available achievements
  available.push(
    {
      id: 'perfect-month',
      type: 'milestone',
      title: 'Perfect Month',
      description: 'Stay under budget for all categories for 30 days',
      icon: Medal,
      rarity: 'legendary',
      points: 500,
      progress: underBudgetCount,
      maxProgress: Math.max(budgets.length, 1)
    },
    {
      id: 'savings-goal',
      type: 'savings',
      title: 'Savings Goal Crusher',
      description: 'Save $1000 across all budgets',
      icon: Gift,
      rarity: 'epic',
      points: 300,
      progress: totalSavings,
      maxProgress: 1000
    }
  )

  return { unlocked, available }
}