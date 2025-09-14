'use client'

import { useState, useMemo } from 'react'
import {
  Lightbulb,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Coffee,
  ShoppingCart,
  Utensils,
  Zap,
  CheckCircle,
  ArrowRight,
  Target,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GoalWithProgress } from '@/lib/validations/goal'
import type { Transaction } from '@/lib/validations/transaction'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface SmartSavingsEngineProps {
  transactions: Transaction[]
  goals: GoalWithProgress[]
  className?: string
}

interface SavingsOpportunity {
  id: string
  type: 'round-up' | 'spending-cut' | 'frequency-reduction' | 'subscription' | 'category-limit'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  potential: number
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  frequency?: string
  monthlyImpact: number
  implementation: string[]
  priority: number
}

interface AutoSavingsRule {
  id: string
  name: string
  type: 'round_up' | 'percentage' | 'fixed_amount'
  enabled: boolean
  amount?: number
  percentage?: number
  goalId?: string
  conditions?: string[]
}

interface SpendingPattern {
  category: string
  averageMonthly: number
  trend: 'increasing' | 'decreasing' | 'stable'
  variability: number
  potentialSavings: number
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
}


export function SmartSavingsEngine({ 
  transactions, 
  goals, 
  className 
}: SmartSavingsEngineProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<SavingsOpportunity | null>(null)
  const [autoSavingsRules, setAutoSavingsRules] = useState<AutoSavingsRule[]>([])
  const [implementedRules, setImplementedRules] = useState<Set<string>>(new Set())

  // Calculate spending patterns and opportunities
  const spendingPatterns = useMemo(
    () => analyzeSpendingPatterns(transactions),
    [transactions]
  )
  
  const savingsOpportunities = useMemo(
    () => generateSavingsOpportunities(transactions, spendingPatterns, goals),
    [transactions, spendingPatterns, goals]
  )

  const totalPotentialSavings = savingsOpportunities.reduce(
    (sum, opp) => sum + opp.monthlyImpact,
    0
  )

  const handleImplementRule = (opportunityId: string) => {
    setImplementedRules(prev => new Set(prev).add(opportunityId))
    // Here you would typically call an API to implement the rule
  }

  const handleCreateAutoRule = (opportunity: SavingsOpportunity) => {
    const newRule: AutoSavingsRule = {
      id: `rule-${Date.now()}`,
      name: opportunity.title,
      type: opportunity.type === 'round-up' ? 'round_up' : 'fixed_amount',
      enabled: true,
      amount: opportunity.monthlyImpact,
      goalId: goals[0]?.id, // Default to first goal
    }
    
    setAutoSavingsRules(prev => [...prev, newRule])
    handleImplementRule(opportunity.id)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Engine Overview */}
      <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Smart Savings Engine</h3>
                <p className="text-sm text-gray-600">AI-powered recommendations to boost your savings</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                ${totalPotentialSavings.toFixed(0)}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Monthly Potential
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {savingsOpportunities.filter(o => o.difficulty === 'easy').length}
              </div>
              <div className="text-xs text-gray-600">Easy Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {autoSavingsRules.filter(r => r.enabled).length}
              </div>
              <div className="text-xs text-gray-600">Active Rules</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {implementedRules.size}
              </div>
              <div className="text-xs text-gray-600">Implemented</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Opportunities Tabs */}
      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="patterns">Spending Patterns</TabsTrigger>
          <TabsTrigger value="automation">Auto Rules</TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {savingsOpportunities
              .sort((a, b) => b.priority - a.priority)
              .map((opportunity) => (
                <SavingsOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  isImplemented={implementedRules.has(opportunity.id)}
                  onImplement={() => handleCreateAutoRule(opportunity)}
                  onViewDetails={() => setSelectedOpportunity(opportunity)}
                />
              ))}
          </div>
        </TabsContent>

        {/* Spending Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spendingPatterns.map((pattern, index) => (
              <SpendingPatternCard
                key={index}
                pattern={pattern}
                onCreateRule={() => {
                  // Create a rule based on spending pattern
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* Auto Rules Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automated Savings Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {autoSavingsRules.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Auto Rules Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Implement savings opportunities to create automated rules
                  </p>
                  <Button variant="outline">
                    Browse Opportunities
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {autoSavingsRules.map((rule) => (
                    <AutoSavingsRuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={(enabled) => {
                        setAutoSavingsRules(prev =>
                          prev.map(r => r.id === rule.id ? { ...r, enabled } : r)
                        )
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Opportunity Detail Modal */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedOpportunity && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <selectedOpportunity.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle>{selectedOpportunity.title}</DialogTitle>
                    <DialogDescription>
                      {selectedOpportunity.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Monthly Savings Potential</span>
                  <span className="text-lg font-bold text-green-600">
                    ${selectedOpportunity.monthlyImpact.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Implementation Steps:</h4>
                  <ul className="space-y-2">
                    {selectedOpportunity.implementation.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      handleCreateAutoRule(selectedOpportunity)
                      setSelectedOpportunity(null)
                    }}
                    disabled={implementedRules.has(selectedOpportunity.id)}
                    className="flex-1"
                  >
                    {implementedRules.has(selectedOpportunity.id) ? 
                      'Already Implemented' : 
                      'Implement Rule'
                    }
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOpportunity(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SavingsOpportunityCard({ 
  opportunity, 
  isImplemented, 
  onImplement, 
  onViewDetails 
}: {
  opportunity: SavingsOpportunity
  isImplemented: boolean
  onImplement: () => void
  onViewDetails: () => void
}) {
  const Icon = opportunity.icon

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isImplemented && 'bg-green-50 border-green-200'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {opportunity.description}
            </p>
          </div>
          {isImplemented && (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <Badge className={cn('text-xs', difficultyColors[opportunity.difficulty])}>
            {opportunity.difficulty} difficulty
          </Badge>
          <span className="text-lg font-bold text-green-600">
            ${opportunity.monthlyImpact.toFixed(0)}/mo
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            size="sm"
            onClick={onImplement}
            disabled={isImplemented}
            className="flex-1"
          >
            {isImplemented ? 'Implemented' : 'Implement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SpendingPatternCard({ 
  pattern, 
  onCreateRule 
}: {
  pattern: SpendingPattern
  onCreateRule: () => void
}) {
  const trendIcon = {
    increasing: TrendingUp,
    decreasing: TrendingUp,
    stable: ArrowRight,
  }[pattern.trend]

  const trendColor = {
    increasing: 'text-red-500',
    decreasing: 'text-green-500',
    stable: 'text-blue-500',
  }[pattern.trend]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{pattern.category}</h3>
          <div className={cn('flex items-center gap-1', trendColor)}>
            {(() => {
              const IconComponent = trendIcon
              return <IconComponent className="w-4 h-4" />
            })()}
            <span className="text-sm font-medium capitalize">{pattern.trend}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Monthly Average</span>
            <span className="font-medium">${pattern.averageMonthly.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Savings Potential</span>
            <span className="font-medium text-green-600">
              ${pattern.potentialSavings.toFixed(0)}
            </span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Variability</span>
              <span className="font-medium">{pattern.variability}%</span>
            </div>
            <Progress value={pattern.variability} className="h-2" />
          </div>
        </div>

        {pattern.potentialSavings > 0 && (
          <Button size="sm" onClick={onCreateRule} className="w-full">
            Create Savings Rule
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function AutoSavingsRuleCard({ 
  rule, 
  onToggle 
}: {
  rule: AutoSavingsRule
  onToggle: (enabled: boolean) => void
}) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-lg border',
      rule.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    )}>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{rule.name}</h4>
        <p className="text-sm text-gray-600">
          {rule.type === 'round_up' && 'Round up transactions to nearest dollar'}
          {rule.type === 'percentage' && `Save ${rule.percentage}% of each transaction`}
          {rule.type === 'fixed_amount' && `Save $${rule.amount} monthly`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium">
            {rule.type === 'fixed_amount' && `$${rule.amount?.toFixed(0)}/mo`}
            {rule.type === 'percentage' && `${rule.percentage}%`}
            {rule.type === 'round_up' && 'Variable'}
          </div>
        </div>
        <Button
          size="sm"
          variant={rule.enabled ? "default" : "outline"}
          onClick={() => onToggle(!rule.enabled)}
        >
          {rule.enabled ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </div>
  )
}

function analyzeSpendingPatterns(transactions: Transaction[]): SpendingPattern[] {
  if (transactions.length === 0) return []
  
  // Group transactions by category
  const categoryGroups = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Other'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(transaction)
    return acc
  }, {} as Record<string, Transaction[]>)
  
  // Analyze patterns for each category
  return Object.entries(categoryGroups)
    .filter(([_, transactions]) => transactions.length >= 3) // Only analyze categories with enough data
    .map(([categoryName, transactions]) => {
      const monthlyAmounts = transactions
        .filter(t => t.type === 'expense')
        .map(t => Math.abs(t.amount))
      
      const averageMonthly = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / Math.max(monthlyAmounts.length, 1)
      const maxAmount = Math.max(...monthlyAmounts)
      const minAmount = Math.min(...monthlyAmounts)
      const variability = monthlyAmounts.length > 1 ? ((maxAmount - minAmount) / averageMonthly) * 100 : 0
      
      // Simple trend calculation based on first half vs second half
      const midpoint = Math.floor(monthlyAmounts.length / 2)
      const firstHalf = monthlyAmounts.slice(0, midpoint)
      const secondHalf = monthlyAmounts.slice(midpoint)
      
      const firstAvg = firstHalf.reduce((sum, amount) => sum + amount, 0) / Math.max(firstHalf.length, 1)
      const secondAvg = secondHalf.reduce((sum, amount) => sum + amount, 0) / Math.max(secondHalf.length, 1)
      
      let trend: 'increasing' | 'decreasing' | 'stable'
      const change = ((secondAvg - firstAvg) / firstAvg) * 100
      if (change > 10) trend = 'increasing'
      else if (change < -10) trend = 'decreasing'
      else trend = 'stable'
      
      // Estimate potential savings (conservative 15-25% for high-variability categories)
      const potentialSavings = variability > 30 ? averageMonthly * 0.25 : averageMonthly * 0.15
      
      return {
        category: categoryName,
        averageMonthly,
        trend,
        variability: Math.min(variability, 100), // Cap at 100%
        potentialSavings,
      }
    })
    .filter(pattern => pattern.averageMonthly > 50) // Only show meaningful categories
    .sort((a, b) => b.potentialSavings - a.potentialSavings) // Sort by potential savings
}

function generateSavingsOpportunities(
  transactions: Transaction[],
  patterns: SpendingPattern[],
  goals: GoalWithProgress[]
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = []
  
  // Always suggest round-up savings if there are transactions
  if (transactions.length > 0) {
    const avgRoundUp = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => {
        const roundUpAmount = Math.ceil(Math.abs(t.amount)) - Math.abs(t.amount)
        return sum + roundUpAmount
      }, 0) / transactions.length
    
    const monthlyRoundUp = avgRoundUp * 30 // Estimate monthly transactions
    
    opportunities.push({
      id: 'round-up',
      type: 'round-up',
      title: 'Round-Up Savings',
      description: 'Round up every purchase to the nearest dollar and save the change',
      icon: PiggyBank,
      potential: monthlyRoundUp,
      difficulty: 'easy',
      monthlyImpact: monthlyRoundUp,
      implementation: [
        'Enable round-up feature in your banking app',
        'Connect to your primary checking account',
        'Choose which goal to allocate savings to',
        'Monitor progress weekly',
      ],
      priority: 90,
    })
  }
  
  // Generate opportunities based on actual spending patterns
  patterns.forEach(pattern => {
    if (pattern.potentialSavings > 20) {
      const categoryName = pattern.category.toLowerCase()
      
      if (categoryName.includes('food') || categoryName.includes('dining') || categoryName.includes('restaurant')) {
        opportunities.push({
          id: `reduce-${pattern.category.replace(/\s+/g, '-').toLowerCase()}`,
          type: 'category-limit',
          title: `Reduce ${pattern.category} Spending`,
          description: `Set a monthly limit on ${pattern.category.toLowerCase()} expenses`,
          icon: Utensils,
          potential: pattern.potentialSavings,
          difficulty: pattern.variability > 40 ? 'medium' : 'easy',
          category: pattern.category,
          monthlyImpact: pattern.potentialSavings,
          implementation: [
            `Set monthly ${pattern.category.toLowerCase()} budget`,
            'Track daily expenses in this category',
            'Find lower-cost alternatives',
            'Plan purchases in advance',
          ],
          priority: Math.min(95, 60 + (pattern.potentialSavings / 10)),
        })
      } else if (categoryName.includes('subscription') || categoryName.includes('service')) {
        opportunities.push({
          id: 'subscription-audit',
          type: 'subscription',
          title: 'Subscription Cleanup',
          description: 'Review and cancel unused subscriptions',
          icon: DollarSign,
          potential: pattern.potentialSavings,
          difficulty: 'easy',
          monthlyImpact: pattern.potentialSavings,
          implementation: [
            'Review all recurring charges',
            'Cancel unused subscriptions',
            'Negotiate better rates on essential services',
            'Set calendar reminders for renewals',
          ],
          priority: 95,
        })
      }
    }
  })
  
  // If no specific opportunities found, provide general advice
  if (opportunities.length === 0 && transactions.length === 0) {
    opportunities.push({
      id: 'start-tracking',
      type: 'frequency-reduction',
      title: 'Start Expense Tracking',
      description: 'Begin tracking your expenses to identify savings opportunities',
      icon: Target,
      potential: 0,
      difficulty: 'easy',
      monthlyImpact: 0,
      implementation: [
        'Log all transactions in the app',
        'Categorize your expenses',
        'Review spending weekly',
        'Look for patterns and trends',
      ],
      priority: 50,
    })
  }
  
  return opportunities.sort((a, b) => b.priority - a.priority)
}