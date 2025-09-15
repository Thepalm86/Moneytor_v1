'use client'

import { useState } from 'react'
import {
  LineChart as _LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as _PieChart,
  Pie as _Pie,
  Cell as _Cell,
  BarChart,
  Bar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown as _TrendingDown,
  Calendar as _Calendar,
  Target,
  Clock,
  Calculator,
  Activity,
  Zap,
} from 'lucide-react'
import {
  format,
  addDays,
  differenceInDays,
  startOfMonth as _startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from 'date-fns'

import { cn } from '@/lib/utils'
import type { GoalWithProgress } from '@/lib/validations/goal'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface GoalVisualizationProps {
  goal: GoalWithProgress
  className?: string
}

interface ProjectionData {
  date: string
  current: number
  projected: number
  optimistic: number
  pessimistic: number
  milestone?: boolean
}

interface CompletionProbability {
  onTime: number
  late: number
  unlikely: number
  factors: {
    currentPace: number
    timeRemaining: number
    consistencyScore: number
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe']

export function GoalVisualization({ goal, className }: GoalVisualizationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90' | 'all'>('60')

  // Generate projection data
  const projectionData = generateProjectionData(goal, selectedPeriod)
  const completionProbability = calculateCompletionProbability(goal)
  const milestoneData = generateMilestoneData(goal)
  const contributionFrequency = generateContributionFrequency(goal)

  const remainingAmount = goal.target_amount - goal.current_amount
  const daysRemaining = goal.target_date
    ? Math.max(0, differenceInDays(new Date(goal.target_date), new Date()))
    : null

  const dailyTarget = daysRemaining && daysRemaining > 0 ? remainingAmount / daysRemaining : 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Progress</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {goal.progress_percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-700">
              ${goal.current_amount.toFixed(0)} of ${goal.target_amount.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Daily Target</span>
            </div>
            <div className="text-2xl font-bold text-green-900">${dailyTarget.toFixed(2)}</div>
            <div className="text-xs text-green-700">
              {daysRemaining ? `${daysRemaining} days left` : 'No deadline'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Completion</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {completionProbability.onTime}%
            </div>
            <div className="text-xs text-purple-700">On-time probability</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Remaining</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">${remainingAmount.toFixed(0)}</div>
            <div className="text-xs text-orange-700">To reach your goal</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs defaultValue="projection" className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="projection">Projection</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="probability">Analysis</TabsTrigger>
          </TabsList>

          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projection Tab */}
        <TabsContent value="projection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Goal Progress Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={value => format(parseISO(value), 'MMM dd')}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={value => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                      labelFormatter={value => format(parseISO(value), 'MMM dd, yyyy')}
                      formatter={(value: number, name: string) => [
                        `$${value.toFixed(2)}`,
                        name === 'current'
                          ? 'Current'
                          : name === 'projected'
                            ? 'Projected'
                            : name === 'optimistic'
                              ? 'Best Case'
                              : 'Worst Case',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="optimistic"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="pessimistic"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Current Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span>Projected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>Best Case</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span>Worst Case</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Progress Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestoneData.map((milestone, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border p-4',
                      milestone.achieved
                        ? 'border-green-200 bg-green-50'
                        : milestone.current
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        milestone.achieved
                          ? 'bg-green-500 text-white'
                          : milestone.current
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-500'
                      )}
                    >
                      {milestone.achieved ? '✓' : milestone.percentage + '%'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{milestone.percentage}% Complete</h3>
                      <p className="text-sm text-gray-600">${milestone.amount.toFixed(2)} target</p>
                      {milestone.projectedDate && !milestone.achieved && (
                        <p className="text-xs text-gray-500">
                          Projected: {format(milestone.projectedDate, 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    {milestone.achieved && (
                      <Badge className="bg-green-100 text-green-800">Achieved!</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Contribution Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionFrequency}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Average']} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Probability Analysis Tab */}
        <TabsContent value="probability" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Completion Probability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">On Time</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${completionProbability.onTime}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {completionProbability.onTime}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Late</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${completionProbability.late}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-yellow-600">
                        {completionProbability.late}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unlikely</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${completionProbability.unlikely}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {completionProbability.unlikely}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Current Pace</span>
                      <span className="font-medium">
                        {completionProbability.factors.currentPace}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${completionProbability.factors.currentPace}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Time Remaining</span>
                      <span className="font-medium">
                        {completionProbability.factors.timeRemaining}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${completionProbability.factors.timeRemaining}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Consistency</span>
                      <span className="font-medium">
                        {completionProbability.factors.consistencyScore}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${completionProbability.factors.consistencyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function generateProjectionData(goal: GoalWithProgress, period: string): ProjectionData[] {
  const days = period === 'all' ? 365 : parseInt(period)
  const startDate = new Date()
  const endDate = goal.target_date ? new Date(goal.target_date) : addDays(startDate, days)

  const currentAmount = goal.current_amount
  const targetAmount = goal.target_amount
  const remainingAmount = targetAmount - currentAmount
  const daysToTarget = differenceInDays(endDate, startDate)

  const dailyRate = daysToTarget > 0 ? remainingAmount / daysToTarget : 0
  const optimisticRate = dailyRate * 1.5
  const pessimisticRate = dailyRate * 0.7

  const endOfPeriod = addDays(startDate, days - 1)
  const actualEndDate = endOfPeriod.getTime() < endDate.getTime() ? endOfPeriod : endDate

  return eachDayOfInterval({
    start: startDate,
    end: actualEndDate,
  }).map((date, index) => ({
    date: date.toISOString().split('T')[0],
    current: index === 0 ? currentAmount : currentAmount + dailyRate * index,
    projected: currentAmount + dailyRate * index,
    optimistic: Math.min(targetAmount, currentAmount + optimisticRate * index),
    pessimistic: currentAmount + pessimisticRate * index,
    milestone: index > 0 && index % 30 === 0,
  }))
}

function calculateCompletionProbability(goal: GoalWithProgress): CompletionProbability {
  const progress = goal.progress_percentage
  const daysRemaining = goal.target_date
    ? Math.max(0, differenceInDays(new Date(goal.target_date), new Date()))
    : 365

  // Simple probability calculation based on current progress and time
  const currentPace = Math.min(100, progress * 2)
  const timeRemaining = Math.max(0, Math.min(100, (daysRemaining / 365) * 100))
  const consistencyScore = Math.random() * 40 + 60 // Mock consistency score

  const onTime = Math.round(Math.min(95, (currentPace + timeRemaining + consistencyScore) / 3))
  const late = Math.round(Math.max(0, Math.min(100 - onTime, 25)))
  const unlikely = Math.round(100 - onTime - late)

  return {
    onTime,
    late,
    unlikely,
    factors: {
      currentPace: Math.round(currentPace),
      timeRemaining: Math.round(timeRemaining),
      consistencyScore: Math.round(consistencyScore),
    },
  }
}

function generateMilestoneData(goal: GoalWithProgress) {
  const milestones = [25, 50, 75, 90, 100]
  const currentProgress = goal.progress_percentage

  return milestones.map(percentage => ({
    percentage,
    amount: (goal.target_amount * percentage) / 100,
    achieved: currentProgress >= percentage,
    current: currentProgress < percentage && currentProgress >= percentage - 10,
    projectedDate: goal.target_date
      ? addDays(new Date(), Math.round(((percentage - currentProgress) / 100) * 90))
      : null,
  }))
}

function generateContributionFrequency(_goal: GoalWithProgress) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Mock data for contribution patterns
  return daysOfWeek.map((day, index) => ({
    day,
    amount: Math.random() * 50 + 10, // Random amount between $10-60
    contributions: Math.floor(Math.random() * 5) + 1,
  }))
}
