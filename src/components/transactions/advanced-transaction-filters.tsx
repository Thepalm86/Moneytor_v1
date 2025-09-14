'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCategories } from '@/hooks/use-categories'
import { formatCurrency } from '@/lib/utils/currency'
import type { TransactionFilters, TransactionSortBy, TransactionSortOrder } from '@/lib/validations/transaction'
import { 
  Search, 
  Calendar as CalendarIcon, 
  DollarSign,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedTransactionFiltersProps {
  userId: string
  filters: TransactionFilters & {
    amountFrom?: number
    amountTo?: number
  }
  sortBy: TransactionSortBy
  sortOrder: TransactionSortOrder
  onFiltersChange: (filters: TransactionFilters & { amountFrom?: number; amountTo?: number }) => void
  onSortChange: (sortBy: TransactionSortBy, sortOrder: TransactionSortOrder) => void
  onReset: () => void
}

type FilterPreset = {
  label: string
  filters: Partial<TransactionFilters>
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    label: 'This Week',
    filters: {
      dateFrom: new Date(new Date().setDate(new Date().getDate() - 7)),
      dateTo: new Date()
    }
  },
  {
    label: 'This Month',
    filters: {
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dateTo: new Date()
    }
  },
  {
    label: 'Income Only',
    filters: {
      type: 'income'
    }
  },
  {
    label: 'Expenses Only',
    filters: {
      type: 'expense'
    }
  }
]

const SORT_OPTIONS: Array<{ value: TransactionSortBy; label: string }> = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'description', label: 'Description' },
  { value: 'category', label: 'Category' }
]

export function AdvancedTransactionFilters({
  userId,
  filters,
  sortBy,
  sortOrder,
  onFiltersChange,
  onSortChange,
  onReset
}: AdvancedTransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [amountRange, setAmountRange] = useState([
    filters.amountFrom || 0,
    filters.amountTo || 10000
  ])

  const { data: categoriesData } = useCategories(userId)
  const categories = categoriesData?.data || []

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }, [filters, onFiltersChange])

  const handleDateRangeChange = (dateFrom?: Date, dateTo?: Date) => {
    onFiltersChange({ 
      ...filters, 
      dateFrom: dateFrom || undefined, 
      dateTo: dateTo || undefined 
    })
  }

  const handleAmountRangeChange = (values: number[]) => {
    setAmountRange(values)
    onFiltersChange({
      ...filters,
      amountFrom: values[0] > 0 ? values[0] : undefined,
      amountTo: values[1] < 10000 ? values[1] : undefined
    })
  }

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.categoryId?.split(',') || []
    let newCategories: string[]

    if (checked) {
      newCategories = [...currentCategories, categoryId]
    } else {
      newCategories = currentCategories.filter(id => id !== categoryId)
    }

    onFiltersChange({
      ...filters,
      categoryId: newCategories.length > 0 ? newCategories.join(',') : undefined
    })
  }

  const handlePresetApply = (preset: FilterPreset) => {
    onFiltersChange({ ...filters, ...preset.filters })
  }

  // Sort functionality is handled by the parent component

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const selectedCategories = filters.categoryId?.split(',') || []

  return (
    <Card className="border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
              <Filter className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-lg">
              Search & Filter
            </CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
            <ChevronDown className={cn("h-4 w-4 ml-1 text-gray-500 transition-transform", isCollapsed && "rotate-180")} />
          </div>
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-gray-600 hover:text-gray-900"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Advanced
                <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", showAdvanced && "rotate-180")} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions by description..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-gray-200 bg-white/80"
            />
          </div>

        {/* Filter Presets */}
        <div className="flex flex-wrap gap-2">
          {FILTER_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetApply(preset)}
              className="text-xs border-gray-200 hover:border-blue-300 hover:text-blue-600"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Type</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  type: value === 'all' ? undefined : value as 'income' | 'expense'
                })
              }
            >
              <SelectTrigger className="border-gray-200 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-200 bg-white/80",
                    !filters.dateFrom && !filters.dateTo && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom && filters.dateTo ? (
                    <>
                      {format(filters.dateFrom, "MMM dd")} - {format(filters.dateTo, "MMM dd, yyyy")}
                    </>
                  ) : filters.dateFrom ? (
                    `From ${format(filters.dateFrom, "MMM dd, yyyy")}`
                  ) : filters.dateTo ? (
                    `Until ${format(filters.dateTo, "MMM dd, yyyy")}`
                  ) : (
                    "Select dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateFrom,
                    to: filters.dateTo,
                  }}
                  onSelect={(range) => {
                    handleDateRangeChange(range?.from, range?.to)
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Sort By</Label>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [TransactionSortBy, TransactionSortOrder]
                onSortChange(newSortBy, newSortOrder)
              }}
            >
              <SelectTrigger className="border-gray-200 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <div key={option.value}>
                    <SelectItem value={`${option.value}-desc`}>
                      {option.label} (Newest/Highest)
                    </SelectItem>
                    <SelectItem value={`${option.value}-asc`}>
                      {option.label} (Oldest/Lowest)
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            {/* Amount Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Amount Range</Label>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatCurrency(amountRange[0])} - {formatCurrency(amountRange[1])}</span>
                </div>
              </div>
              <Slider
                value={amountRange}
                onValueChange={handleAmountRangeChange}
                max={10000}
                step={50}
                className="w-full"
              />
            </div>

            {/* Categories Multi-Select */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Categories</Label>
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCategories.length} selected
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id)
                  return (
                    <div 
                      key={category.id} 
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-50",
                        isSelected 
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleCategoryToggle(category.id, !isSelected)}
                    >
                      <Checkbox
                        id={category.id}
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleCategoryToggle(category.id, checked as boolean)
                        }
                        className={cn(
                          isSelected && "border-blue-500 data-[state=checked]:bg-blue-600"
                        )}
                      />
                      <label
                        htmlFor={category.id}
                        className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                      >
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full border transition-all duration-200",
                            isSelected 
                              ? "border-2 border-white shadow-md ring-2 ring-offset-1" 
                              : "border border-gray-300"
                          )}
                          style={{ 
                            backgroundColor: category.color
                          }}
                        />
                        <span className={cn(
                          "truncate transition-colors duration-200",
                          isSelected ? "text-blue-900 font-medium" : "text-gray-700"
                        )}>
                          {category.name}
                        </span>
                        {isSelected && (
                          <div className="ml-auto">
                            <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            {filters.search && (
              <Badge variant="outline" className="gap-1">
                Search: "{filters.search}"
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleSearchChange('')}
                />
              </Badge>
            )}
            {filters.type && (
              <Badge variant="outline" className="gap-1">
                Type: {filters.type}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => onFiltersChange({ ...filters, type: undefined })}
                />
              </Badge>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <Badge variant="outline" className="gap-1">
                Date Range
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleDateRangeChange(undefined, undefined)}
                />
              </Badge>
            )}
            {selectedCategories.length > 0 && (
              <Badge variant="outline" className="gap-1">
                {selectedCategories.length} Categories
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => onFiltersChange({ ...filters, categoryId: undefined })}
                />
              </Badge>
            )}
            {(filters.amountFrom || filters.amountTo) && (
              <Badge variant="outline" className="gap-1">
                Amount Range
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => {
                    setAmountRange([0, 10000])
                    onFiltersChange({ 
                      ...filters, 
                      amountFrom: undefined, 
                      amountTo: undefined 
                    })
                  }}
                />
              </Badge>
            )}
          </div>
        )}
        </CardContent>
      )}
      
      {/* Collapsed View - Show only essential info */}
      {isCollapsed && activeFilterCount > 0 && (
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="outline" className="gap-1 text-xs">
                Search: "{filters.search.substring(0, 20)}{filters.search.length > 20 ? '...' : ''}"
              </Badge>
            )}
            {filters.type && (
              <Badge variant="outline" className="gap-1 text-xs">
                Type: {filters.type}
              </Badge>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <Badge variant="outline" className="gap-1 text-xs">
                Date Range
              </Badge>
            )}
            {selectedCategories.length > 0 && (
              <Badge variant="outline" className="gap-1 text-xs">
                {selectedCategories.length} Categories
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}