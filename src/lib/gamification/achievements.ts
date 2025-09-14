// ==================================================
// ACHIEVEMENT DEFINITIONS
// Complete achievement system configuration
// ==================================================

import type { Achievement, AchievementId } from '@/types/gamification'

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  // 🥇 Financial Milestones
  first_steps: {
    id: 'first_steps',
    type: 'milestone',
    title: 'First Steps',
    description: 'Complete your first transaction entry',
    icon: '👋',
    color: '#22c55e',
    rarity: 'common',
    points: 10,
    requirements: [
      { metric: 'total_transactions', operator: '>=', value: 1 }
    ]
  },

  getting_started: {
    id: 'getting_started',
    type: 'milestone',
    title: 'Getting Started',
    description: 'Complete 10 transactions',
    icon: '🚀',
    color: '#3b82f6',
    rarity: 'common',
    points: 25,
    requirements: [
      { metric: 'total_transactions', operator: '>=', value: 10 }
    ]
  },

  saver: {
    id: 'saver',
    type: 'milestone',
    title: 'Saver',
    description: 'Reach your first $100 saved',
    icon: '💰',
    color: '#f59e0b',
    rarity: 'uncommon',
    points: 50,
    requirements: [
      { metric: 'total_savings', operator: '>=', value: 100 }
    ]
  },

  big_saver: {
    id: 'big_saver',
    type: 'milestone',
    title: 'Big Saver',
    description: 'Reach $1,000 saved',
    icon: '🏆',
    color: '#f59e0b',
    rarity: 'rare',
    points: 100,
    requirements: [
      { metric: 'total_savings', operator: '>=', value: 1000 }
    ]
  },

  goal_crusher: {
    id: 'goal_crusher',
    type: 'milestone',
    title: 'Goal Crusher',
    description: 'Complete your first savings goal',
    icon: '🎯',
    color: '#06d6a0',
    rarity: 'uncommon',
    points: 75,
    requirements: [
      { metric: 'goals_completed', operator: '>=', value: 1 }
    ]
  },

  budget_master: {
    id: 'budget_master',
    type: 'milestone',
    title: 'Budget Master',
    description: 'Stay under budget for a full month',
    icon: '📊',
    color: '#8b5cf6',
    rarity: 'rare',
    points: 100,
    requirements: [
      { metric: 'budget_adherence_months', operator: '>=', value: 1 }
    ]
  },

  net_positive: {
    id: 'net_positive',
    type: 'milestone',
    title: 'Net Positive',
    description: 'Achieve positive cash flow for a month',
    icon: '📈',
    color: '#10b981',
    rarity: 'uncommon',
    points: 60,
    requirements: [
      { metric: 'net_positive_months', operator: '>=', value: 1 }
    ]
  },

  // 🔥 Behavioral Streaks
  consistent_tracker: {
    id: 'consistent_tracker',
    type: 'streak',
    title: 'Consistent Tracker',
    description: 'Log transactions for 7 days straight',
    icon: '🔥',
    color: '#ef4444',
    rarity: 'common',
    points: 30,
    requirements: [
      { metric: 'transaction_streak', operator: '>=', value: 7 }
    ]
  },

  dedicated_user: {
    id: 'dedicated_user',
    type: 'streak',
    title: 'Dedicated User',
    description: 'Log transactions for 30 days straight',
    icon: '🔥',
    color: '#dc2626',
    rarity: 'rare',
    points: 150,
    requirements: [
      { metric: 'transaction_streak', operator: '>=', value: 30 }
    ]
  },

  budget_champion: {
    id: 'budget_champion',
    type: 'streak',
    title: 'Budget Champion',
    description: 'Stay within budget for 7 days straight',
    icon: '🏅',
    color: '#7c3aed',
    rarity: 'uncommon',
    points: 80,
    requirements: [
      { metric: 'budget_streak', operator: '>=', value: 7 }
    ]
  },

  financial_discipline: {
    id: 'financial_discipline',
    type: 'streak',
    title: 'Financial Discipline',
    description: 'Stay within budget for 30 days straight',
    icon: '🏅',
    color: '#6d28d9',
    rarity: 'epic',
    points: 200,
    requirements: [
      { metric: 'budget_streak', operator: '>=', value: 30 }
    ]
  },

  savings_habit: {
    id: 'savings_habit',
    type: 'streak',
    title: 'Savings Habit',
    description: 'Make goal contributions for 7 days straight',
    icon: '💎',
    color: '#059669',
    rarity: 'uncommon',
    points: 70,
    requirements: [
      { metric: 'goal_streak', operator: '>=', value: 7 }
    ]
  },

  long_term_thinker: {
    id: 'long_term_thinker',
    type: 'streak',
    title: 'Long-term Thinker',
    description: 'Make goal contributions for 30 days straight',
    icon: '💎',
    color: '#047857',
    rarity: 'epic',
    points: 180,
    requirements: [
      { metric: 'goal_streak', operator: '>=', value: 30 }
    ]
  },

  // 🎓 Learning Achievements
  organizer: {
    id: 'organizer',
    type: 'learning',
    title: 'Organizer',
    description: 'Create your first custom category',
    icon: '📁',
    color: '#6366f1',
    rarity: 'common',
    points: 20,
    requirements: [
      { metric: 'categories_created', operator: '>=', value: 1 }
    ]
  },

  category_master: {
    id: 'category_master',
    type: 'learning',
    title: 'Category Master',
    description: 'Create 5 custom categories',
    icon: '📂',
    color: '#7c3aed',
    rarity: 'uncommon',
    points: 50,
    requirements: [
      { metric: 'categories_created', operator: '>=', value: 5 }
    ]
  },

  color_coordinator: {
    id: 'color_coordinator',
    type: 'learning',
    title: 'Color Coordinator',
    description: 'Customize category colors and icons',
    icon: '🎨',
    color: '#ec4899',
    rarity: 'common',
    points: 30,
    requirements: [
      { metric: 'categories_customized', operator: '>=', value: 3 }
    ]
  },

  spending_analyst: {
    id: 'spending_analyst',
    type: 'learning',
    title: 'Spending Analyst',
    description: 'Use 10+ different categories in a month',
    icon: '📊',
    color: '#0ea5e9',
    rarity: 'rare',
    points: 80,
    requirements: [
      { metric: 'categories_used_monthly', operator: '>=', value: 10 }
    ]
  },

  planner: {
    id: 'planner',
    type: 'learning',
    title: 'Planner',
    description: 'Create your first budget',
    icon: '📋',
    color: '#8b5cf6',
    rarity: 'common',
    points: 25,
    requirements: [
      { metric: 'budgets_created', operator: '>=', value: 1 }
    ]
  },

  dreamer: {
    id: 'dreamer',
    type: 'learning',
    title: 'Dreamer',
    description: 'Create your first savings goal',
    icon: '🌟',
    color: '#06d6a0',
    rarity: 'common',
    points: 25,
    requirements: [
      { metric: 'goals_created', operator: '>=', value: 1 }
    ]
  },

  explorer: {
    id: 'explorer',
    type: 'learning',
    title: 'Explorer',
    description: 'Use all major app features',
    icon: '🧭',
    color: '#0ea5e9',
    rarity: 'uncommon',
    points: 60,
    requirements: [
      { metric: 'features_used', operator: '>=', value: 5 }
    ]
  },

  power_user: {
    id: 'power_user',
    type: 'learning',
    title: 'Power User',
    description: 'Achieve advanced feature mastery',
    icon: '⚡',
    color: '#f59e0b',
    rarity: 'rare',
    points: 120,
    requirements: [
      { metric: 'advanced_features_used', operator: '>=', value: 3 },
      { metric: 'total_transactions', operator: '>=', value: 100 }
    ]
  },

  financial_guru: {
    id: 'financial_guru',
    type: 'learning',
    title: 'Financial Guru',
    description: 'Demonstrate optimal financial patterns',
    icon: '🧠',
    color: '#8b5cf6',
    rarity: 'epic',
    points: 250,
    requirements: [
      { metric: 'optimization_score', operator: '>=', value: 90 },
      { metric: 'months_active', operator: '>=', value: 3 }
    ]
  },

  // 🏆 Premium Accomplishments
  perfect_month: {
    id: 'perfect_month',
    type: 'premium',
    title: 'Perfect Month',
    description: 'Achieve all goals in a single month',
    icon: '✨',
    color: '#d946ef',
    rarity: 'legendary',
    points: 300,
    requirements: [
      { metric: 'perfect_months', operator: '>=', value: 1 }
    ]
  },

  growth_mindset: {
    id: 'growth_mindset',
    type: 'premium',
    title: 'Growth Mindset',
    description: 'Show consistent month-over-month improvement',
    icon: '📊',
    color: '#06d6a0',
    rarity: 'epic',
    points: 200,
    requirements: [
      { metric: 'improvement_months', operator: '>=', value: 3 }
    ]
  },

  smart_spender: {
    id: 'smart_spender',
    type: 'premium',
    title: 'Smart Spender',
    description: 'Demonstrate optimized spending patterns',
    icon: '🎯',
    color: '#0ea5e9',
    rarity: 'rare',
    points: 150,
    requirements: [
      { metric: 'spending_efficiency', operator: '>=', value: 85 },
      { metric: 'months_tracked', operator: '>=', value: 2 }
    ]
  },

  financial_wellness: {
    id: 'financial_wellness',
    type: 'premium',
    title: 'Financial Wellness',
    description: 'Maintain consistent positive financial trends',
    icon: '🌿',
    color: '#10b981',
    rarity: 'epic',
    points: 220,
    requirements: [
      { metric: 'wellness_score', operator: '>=', value: 80 },
      { metric: 'consistent_months', operator: '>=', value: 6 }
    ]
  },

  elite_user: {
    id: 'elite_user',
    type: 'premium',
    title: 'Elite User',
    description: 'Achieve top-tier performance across all metrics',
    icon: '👑',
    color: '#fbbf24',
    rarity: 'legendary',
    points: 500,
    requirements: [
      { metric: 'overall_score', operator: '>=', value: 95 },
      { metric: 'achievements_earned', operator: '>=', value: 15 },
      { metric: 'months_active', operator: '>=', value: 6 }
    ]
  }
}

// Helper functions
export function getAchievement(id: AchievementId): Achievement {
  return ACHIEVEMENTS[id]
}

export function getAchievementsByType(type: Achievement['type']): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(achievement => achievement.type === type)
}

export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(achievement => achievement.rarity === rarity)
}

export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS)
}

export function getTotalAchievementPoints(): number {
  return Object.values(ACHIEVEMENTS).reduce((total, achievement) => total + achievement.points, 0)
}

// Achievement validation
export function validateAchievementRequirements(
  achievement: Achievement,
  userStats: Record<string, number>
): boolean {
  return achievement.requirements.every(requirement => {
    const userValue = userStats[requirement.metric] || 0
    const targetValue = typeof requirement.value === 'number' ? requirement.value : 0
    
    switch (requirement.operator) {
      case '>=': return userValue >= targetValue
      case '>': return userValue > targetValue
      case '=': return userValue === targetValue
      case '<': return userValue < targetValue
      case '<=': return userValue <= targetValue
      default: return false
    }
  })
}