'use client'

/**
 * Settings Search Component - Simplified Version
 * Basic search and filtering functionality for settings
 */

import { useState } from 'react'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface SettingsSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
  availableCategories: { id: string; label: string; count: number }[]
  placeholder?: string
  className?: string
}

const categoryColors: Record<string, string> = {
  account: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  preferences: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  notifications: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  privacy: 'bg-red-100 text-red-700 hover:bg-red-200',
}

export function SettingsSearch({
  searchQuery,
  onSearchChange,
  categories,
  onCategoriesChange,
  availableCategories,
  placeholder = 'Search settings...',
  className,
}: SettingsSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const totalSettings = availableCategories.reduce((total, cat) => total + cat.count, 0)

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = categories.includes(categoryId)
      ? categories.filter(c => c !== categoryId)
      : [...categories, categoryId]
    
    onCategoriesChange(newCategories)
  }

  const handleClearFilters = () => {
    onSearchChange('')
    onCategoriesChange([])
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Category Filter */}
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Categories
                {categories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                    {categories.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={categories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{category.label}</span>
                    <Badge variant="outline" className="ml-2">
                      {category.count}
                    </Badge>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              {categories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="w-full justify-start h-8"
                  >
                    Clear filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active Filters */}
          {categories.map((categoryId) => {
            const category = availableCategories.find(c => c.id === categoryId)
            return category ? (
              <Badge
                key={categoryId}
                variant="secondary"
                className={cn('cursor-pointer', categoryColors[categoryId] || 'bg-gray-100 text-gray-700')}
                onClick={() => handleCategoryToggle(categoryId)}
              >
                {category.label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ) : null
          })}
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          {searchQuery || categories.length > 0 ? (
            <span>
              Filtering settings
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          ) : (
            <span>{totalSettings} total settings</span>
          )}
        </div>
      </div>

      {/* Clear All Filters */}
      {(searchQuery || categories.length > 0) && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}