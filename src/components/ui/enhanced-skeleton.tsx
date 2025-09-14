'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-200',
        animate && 'animate-shimmer',
        className
      )}
    />
  )
}

// Card skeleton for dashboard cards and transaction cards
export function CardSkeleton({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart skeleton for data visualization loading
export function ChartSkeleton({ className, height = 'h-64' }: { className?: string; height?: string }) {
  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      
      {/* Chart area */}
      <div className={cn('relative', height)}>
        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full w-8 space-y-4 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-6" />
          ))}
        </div>
        
        {/* Chart bars/lines simulation */}
        <div className="ml-12 mr-4 h-full">
          <div className="flex h-full items-end space-x-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 space-y-1">
                <Skeleton 
                  className={cn(
                    'w-full',
                    `h-${Math.floor(Math.random() * 20) + 8}`
                  )} 
                />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
        
        {/* X-axis */}
        <div className="ml-12 mt-2 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-12" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Mobile-specific transaction list skeleton
export function MobileTransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {/* Mobile search bar skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      
      {/* Mobile filter tabs skeleton */}
      <div className="flex space-x-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      
      {/* Transaction cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 rounded-lg border bg-card p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Dashboard overview skeleton 
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Stats cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} rows={1} />
        ))}
      </div>
      
      {/* Chart section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton height="h-80" />
        <div className="space-y-4">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={2} />
        </div>
      </div>
    </div>
  )
}

// Table skeleton for desktop views
export function TableSkeleton({ 
  columns = 5, 
  rows = 8,
  showHeader = true 
}: { 
  columns?: number
  rows?: number 
  showHeader?: boolean
}) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      {showHeader && (
        <div className="flex items-center space-x-4 border-b pb-2">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-2">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton 
                key={j} 
                className={cn(
                  'h-4',
                  j === 0 ? 'w-8' : // First column (checkbox/icon)
                  j === 1 ? 'flex-1' : // Main content column
                  j === columns - 1 ? 'w-20' : // Last column (amount/actions)
                  'w-24' // Other columns
                )} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Form skeleton for loading forms
export function FormSkeleton({ 
  fields = 4,
  showActions = true 
}: { 
  fields?: number
  showActions?: boolean 
}) {
  return (
    <div className="space-y-6">
      {/* Form header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Form fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ))}
      </div>
      
      {/* Form actions */}
      {showActions && (
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  )
}

// Mobile-specific chart skeleton
export function MobileChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      {/* Mobile chart header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      {/* Mobile chart area - smaller height */}
      <div className="h-48 relative">
        {/* Simplified mobile chart bars */}
        <div className="flex h-full items-end justify-between px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                'w-6',
                `h-${Math.floor(Math.random() * 16) + 8}`
              )} 
            />
          ))}
        </div>
        
        {/* Mobile X-axis labels */}
        <div className="mt-2 flex justify-between px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-8" />
          ))}
        </div>
      </div>
      
      {/* Mobile chart controls */}
      <div className="flex justify-center">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Progressive loading skeleton - starts with basic structure then adds detail
export function ProgressiveSkeleton({ 
  stage = 1,
  maxStages = 3 
}: { 
  stage?: number
  maxStages?: number 
}) {
  if (stage === 1) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  
  if (stage === 2) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  
  // Stage 3 - Full detailed skeleton
  return <DashboardSkeleton />
}