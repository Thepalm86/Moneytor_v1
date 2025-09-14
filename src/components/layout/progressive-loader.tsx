'use client'

import React from 'react'
import { useProgressiveLoading, useIntersectionObserver } from '@/lib/utils/performance'
import { 
  DashboardSkeleton, 
  ChartSkeleton, 
  MobileChartSkeleton,
  MobileTransactionListSkeleton,
  ProgressiveSkeleton 
} from '@/components/ui/enhanced-skeleton'

interface ProgressiveLoaderProps {
  children: React.ReactNode
  type?: 'dashboard' | 'chart' | 'list' | 'generic'
  stages?: number
  stageDelay?: number
  useIntersection?: boolean
  className?: string
}

export function ProgressiveLoader({
  children,
  type = 'generic',
  stages = 3,
  stageDelay = 200,
  useIntersection = false,
  className
}: ProgressiveLoaderProps) {
  const progressiveStage = useProgressiveLoading(stages, stageDelay)
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // If using intersection observer, only start loading when in view
  const shouldLoad = useIntersection ? isIntersecting : true
  const currentStage = shouldLoad ? progressiveStage : 1

  // Return appropriate skeleton for each stage
  const getSkeleton = (stage: number) => {
    if (stage < stages) {
      switch (type) {
        case 'dashboard':
          return <ProgressiveSkeleton stage={stage} maxStages={stages} />
        case 'chart':
          return (
            <>
              <div className="block lg:hidden">
                <MobileChartSkeleton className={className} />
              </div>
              <div className="hidden lg:block">
                <ChartSkeleton className={className} />
              </div>
            </>
          )
        case 'list':
          return <MobileTransactionListSkeleton />
        default:
          return <DashboardSkeleton />
      }
    }
    return children
  }

  return (
    <div ref={useIntersection ? ref : undefined} className={className}>
      {getSkeleton(currentStage)}
    </div>
  )
}

// Specialized progressive loaders for common use cases

export function ProgressiveChartLoader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <ProgressiveLoader
      type="chart"
      stages={2}
      stageDelay={300}
      useIntersection
      className={className}
    >
      {children}
    </ProgressiveLoader>
  )
}

export function ProgressiveDashboardLoader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <ProgressiveLoader
      type="dashboard"
      stages={3}
      stageDelay={200}
      className={className}
    >
      {children}
    </ProgressiveLoader>
  )
}

export function ProgressiveListLoader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <ProgressiveLoader
      type="list"
      stages={2}
      stageDelay={150}
      useIntersection
      className={className}
    >
      {children}
    </ProgressiveLoader>
  )
}

// Lazy loading with progressive enhancement
export function LazyProgressiveLoader({ 
  children,
  fallback,
  className 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string 
}) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px'
  })
  const [hasLoaded, setHasLoaded] = React.useState(false)

  React.useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isIntersecting, hasLoaded])

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? children : (fallback || <DashboardSkeleton />)}
    </div>
  )
}