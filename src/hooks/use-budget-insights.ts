'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { BudgetWithStats } from '@/lib/validations/budget'

interface BudgetInsight {
  type: 'recommendation' | 'alert' | 'tip'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category?: string
}

interface BudgetAnalytics {
  totalBudgeted: number
  totalSpent: number
  averageUtilization: number
  overBudgetCount: number
  underUtilizedCount: number
  savingsTotal: number
}

export function useBudgetInsights(budgets: BudgetWithStats[]) {
  return useMemo(() => {
    const insights: BudgetInsight[] = []
    const analytics: BudgetAnalytics = {
      totalBudgeted: 0,
      totalSpent: 0,
      averageUtilization: 0,
      overBudgetCount: 0,
      underUtilizedCount: 0,
      savingsTotal: 0
    }

    if (budgets.length === 0) {
      return { insights, analytics }
    }

    // Calculate analytics
    analytics.totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
    analytics.totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0)
    analytics.averageUtilization = budgets.reduce((sum, b) => sum + b.spent_percentage, 0) / budgets.length
    analytics.overBudgetCount = budgets.filter(b => b.is_over_budget).length
    analytics.underUtilizedCount = budgets.filter(b => b.spent_percentage < 50).length
    analytics.savingsTotal = budgets.reduce((sum, b) => sum + Math.max(0, b.remaining_amount), 0)

    // Generate insights
    // Over budget alerts
    budgets.forEach(budget => {
      if (budget.is_over_budget) {
        insights.push({
          type: 'alert',
          title: `${budget.category?.name} over budget`,
          description: `You've spent $${budget.spent_amount.toFixed(2)} of your $${budget.amount.toFixed(2)} budget (${budget.spent_percentage.toFixed(0)}%)`,
          priority: 'high',
          category: budget.category?.name
        })
      }
    })

    // Near limit warnings
    budgets.forEach(budget => {
      if (budget.spent_percentage >= 80 && !budget.is_over_budget) {
        insights.push({
          type: 'alert',
          title: `${budget.category?.name} approaching limit`,
          description: `You've used ${budget.spent_percentage.toFixed(0)}% of this budget. Consider slowing spending or adjusting the limit.`,
          priority: 'medium',
          category: budget.category?.name
        })
      }
    })

    // Under-utilized budget recommendations
    budgets.forEach(budget => {
      if (budget.spent_percentage < 30 && budget.spent_amount > 0) {
        insights.push({
          type: 'recommendation',
          title: `${budget.category?.name} budget underused`,
          description: `Only ${budget.spent_percentage.toFixed(0)}% used. Consider reducing the budget or finding opportunities to optimize spending.`,
          priority: 'low',
          category: budget.category?.name
        })
      }
    })

    // General recommendations
    if (analytics.underUtilizedCount > 2) {
      insights.push({
        type: 'recommendation',
        title: 'Multiple underutilized budgets',
        description: `${analytics.underUtilizedCount} budgets are under 50% utilized. Consider reallocating funds to categories you use more.`,
        priority: 'medium'
      })
    }

    if (analytics.overBudgetCount === 0 && budgets.length >= 3) {
      insights.push({
        type: 'tip',
        title: 'Great budgeting discipline!',
        description: 'You\'re staying within all your budget limits. Consider setting more aggressive savings goals.',
        priority: 'low'
      })
    }

    // Seasonal recommendations
    const month = new Date().getMonth()
    if ([11, 0].includes(month)) { // Holiday season
      insights.push({
        type: 'tip',
        title: 'Holiday season budgeting',
        description: 'Consider creating temporary budgets for gift shopping and entertainment during the holiday season.',
        priority: 'medium'
      })
    }

    return { insights, analytics }
  }, [budgets])
}

export function useBudgetRecommendations(userId: string) {
  return useQuery({
    queryKey: ['budget-recommendations', userId],
    queryFn: async () => {
      // Get recent transactions to analyze spending patterns
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          date,
          category:categories (
            id,
            name,
            type
          )
        `)
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
        .order('date', { ascending: false })
        .limit(500)

      if (error) throw error

      // Analyze spending patterns
      const categorySpending = new Map<string, { total: number; count: number; name: string }>()
      
      transactions?.forEach((transaction: any) => {
        if (transaction.category) {
          const categoryId = transaction.category.id
          const current = categorySpending.get(categoryId) || { total: 0, count: 0, name: transaction.category.name }
          current.total += Number(transaction.amount)
          current.count += 1
          categorySpending.set(categoryId, current)
        }
      })

      // Generate recommendations
      const recommendations = []
      
      for (const [categoryId, data] of Array.from(categorySpending.entries())) {
        const monthlyAverage = data.total / 3 // 3 months of data
        const suggestedBudget = Math.round(monthlyAverage * 1.1) // 10% buffer
        
        recommendations.push({
          categoryId,
          categoryName: data.name,
          monthlyAverage,
          suggestedBudget,
          transactionCount: data.count,
          reasoning: `Based on your last 3 months of spending ($${monthlyAverage.toFixed(2)} average), we suggest a budget of $${suggestedBudget} with a 10% buffer.`
        })
      }

      // Sort by spending amount (highest first)
      recommendations.sort((a, b) => b.monthlyAverage - a.monthlyAverage)

      return recommendations.slice(0, 10) // Top 10 recommendations
    },
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Removed useBudgetPerformanceHistory as it contained mock data
// and we don't have the infrastructure to track historical budget performance yet
// This functionality can be added later when we implement budget performance tracking

export function useBudgetOptimization(budgets: BudgetWithStats[]) {
  return useMemo(() => {
    const optimizations: Array<{
      budgetId: string
      categoryName: string
      currentAmount: number
      suggestedAmount: number
      reasoning: string
      potentialSavings: number
    }> = []

    budgets.forEach(budget => {
      const currentAmount = Number(budget.amount)
      let suggestedAmount = currentAmount
      let reasoning = ''
      
      if (budget.spent_percentage < 30 && budget.spent_amount > 0) {
        // Significantly under-utilized
        suggestedAmount = Math.round(budget.spent_amount * 1.2) // 20% buffer
        reasoning = 'Reduce budget by ' + Math.round(((currentAmount - suggestedAmount) / currentAmount) * 100) + '% based on low utilization'
      } else if (budget.spent_percentage > 95 && !budget.is_over_budget) {
        // Very high utilization but not over
        suggestedAmount = Math.round(currentAmount * 1.15) // 15% increase
        reasoning = 'Increase budget by 15% to provide more breathing room'
      } else if (budget.is_over_budget) {
        // Over budget
        suggestedAmount = Math.round(budget.spent_amount * 1.1) // 10% buffer over current spending
        reasoning = 'Increase budget to accommodate actual spending patterns'
      }

      if (suggestedAmount !== currentAmount) {
        optimizations.push({
          budgetId: budget.id,
          categoryName: budget.category?.name || 'Unknown',
          currentAmount,
          suggestedAmount,
          reasoning,
          potentialSavings: Math.max(0, currentAmount - suggestedAmount)
        })
      }
    })

    const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0)

    return {
      optimizations,
      totalPotentialSavings,
      hasOptimizations: optimizations.length > 0
    }
  }, [budgets])
}