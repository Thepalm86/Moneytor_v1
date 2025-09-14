'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BudgetWithStats } from '@/lib/validations/budget'

interface BudgetPerformanceChartsProps {
  budgets: BudgetWithStats[]
  dateRange?: { start: Date; end: Date }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function BudgetPerformanceCharts({ budgets, dateRange }: BudgetPerformanceChartsProps) {
  const { barData, pieData, performanceData } = useMemo(() => {
    // Budget vs Actual Bar Chart Data
    const barData = budgets.map(budget => ({
      name: budget.category?.name || 'Unknown',
      budgeted: Number(budget.amount),
      spent: budget.spent_amount,
      remaining: budget.remaining_amount,
      percentage: budget.spent_percentage
    }))

    // Budget Distribution Pie Chart
    const pieData = budgets
      .filter(budget => budget.spent_amount > 0)
      .map(budget => ({
        name: budget.category?.name || 'Unknown',
        value: budget.spent_amount,
        color: budget.category?.color || COLORS[0]
      }))

    // Performance Analysis
    const performanceData = budgets.map(budget => ({
      name: budget.category?.name || 'Unknown',
      efficiency: Math.max(0, 100 - budget.spent_percentage),
      utilization: budget.spent_percentage,
      projectedSavings: Math.max(0, budget.remaining_amount),
      isOverBudget: budget.is_over_budget
    }))

    return { barData, pieData, performanceData }
  }, [budgets])

  if (budgets.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Budget Data</h3>
          <p className="text-gray-600">Create budgets to see performance charts and trends.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Budget Performance</h2>
            <p className="text-sm text-gray-600">Visual analysis of your budget effectiveness</p>
          </div>
        </div>
        {dateRange && (
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Budget vs Actual Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Budget vs Actual Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${Number(value).toFixed(2)}`,
                        name === 'budgeted' ? 'Budgeted' : name === 'spent' ? 'Spent' : 'Remaining'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                    <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                    <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Total Budgeted</p>
                <p className="text-lg font-semibold">${barData.reduce((sum, item) => sum + item.budgeted, 0).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Total Spent</p>
                <p className="text-lg font-semibold">${barData.reduce((sum, item) => sum + item.spent, 0).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Total Remaining</p>
                <p className="text-lg font-semibold">${barData.reduce((sum, item) => sum + Math.max(0, item.remaining), 0).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Avg. Utilization</p>
                <p className="text-lg font-semibold">{
                  budgets.length > 0 
                    ? Math.round(budgets.reduce((sum, b) => sum + b.spent_percentage, 0) / budgets.length)
                    : 0
                }%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Spending Distribution */}
        <TabsContent value="distribution">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Spending Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance">
          <div className="space-y-4">
            {performanceData.map((budget, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{budget.name}</h3>
                    <div className="flex items-center gap-2">
                      {budget.isOverBudget && (
                        <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                      )}
                      <Badge variant={budget.efficiency > 50 ? "default" : "secondary"} className="text-xs">
                        {budget.efficiency.toFixed(0)}% Efficient
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Utilization</p>
                      <p className="font-semibold">{budget.utilization.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Efficiency</p>
                      <p className="font-semibold">{budget.efficiency.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Potential Savings</p>
                      <p className="font-semibold text-green-600">${budget.projectedSavings.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Budget Performance</span>
                      <span>{budget.utilization.toFixed(1)}% used</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          budget.isOverBudget 
                            ? 'bg-red-500' 
                            : budget.utilization > 80 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

