'use client'

import React, { Suspense, lazy, ComponentType, ReactElement } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  DashboardSkeleton,
  MobileChartSkeleton,
  MobileTransactionListSkeleton,
} from '@/components/ui/enhanced-skeleton'

// Generic lazy loading wrapper with skeleton fallback
export function withLazyLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback: ReactElement = <DashboardSkeleton />
) {
  const LazyComponent = lazy(importFn)

  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    )
  }
}

// Next.js dynamic import wrapper with mobile-optimized loading
export function withDynamicLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: ReactElement
    ssr?: boolean
    loading?: () => ReactElement
  } = {}
) {
  return dynamic(importFn, {
    ssr: options.ssr ?? true,
    loading: options.loading ?? (() => options.fallback ?? <DashboardSkeleton />),
  })
}

// Mobile-specific lazy loading for charts
export function withMobileLazyChart<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  return withLazyLoading(importFn, <MobileChartSkeleton />)
}

// Mobile-specific lazy loading for transaction lists
export function withMobileLazyList<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  return withLazyLoading(importFn, <MobileTransactionListSkeleton />)
}

// Progressive loading hook - loads content in stages
export function useProgressiveLoading(stages: number = 3, delay: number = 200) {
  const [currentStage, setCurrentStage] = React.useState(1)

  React.useEffect(() => {
    if (currentStage < stages) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [currentStage, stages, delay])

  return currentStage
}

// Intersection Observer hook for lazy loading on scroll
export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const targetRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(target)

    return () => observer.unobserve(target)
  }, [])

  return [targetRef, isIntersecting] as const
}

// Bundle splitting for mobile vs desktop
export function withResponsiveLoading<T extends object>(
  mobileImport: () => Promise<{ default: ComponentType<T> }>,
  desktopImport: () => Promise<{ default: ComponentType<T> }>,
  fallback: ReactElement = <DashboardSkeleton />
) {
  const ResponsiveComponent = React.memo(function ResponsiveComponent(props: T) {
    const [isMobile, setIsMobile] = React.useState(false)
    const [Component, setComponent] = React.useState<ComponentType<T> | null>(null)

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024) // lg breakpoint
      }

      checkMobile()
      window.addEventListener('resize', checkMobile)

      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    React.useEffect(() => {
      const loadComponent = async () => {
        try {
          const { default: LoadedComponent } = isMobile
            ? await mobileImport()
            : await desktopImport()
          setComponent(() => LoadedComponent)
        } catch (error) {
          console.error('Failed to load component:', error)
        }
      }

      loadComponent()
    }, [isMobile])

    if (!Component) {
      return fallback
    }

    return <Component {...props} />
  })

  ResponsiveComponent.displayName = 'ResponsiveComponent'

  return ResponsiveComponent
}

// Preload utility for critical resources
export function preloadComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  // Start loading the component immediately
  importFn().catch(error => {
    console.error('Failed to preload component:', error)
  })
}

// Performance monitoring utility
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map()

  static startTiming(key: string) {
    this.metrics.set(`${key}_start`, performance.now())
  }

  static endTiming(key: string): number {
    const startTime = this.metrics.get(`${key}_start`)
    if (!startTime) return 0

    const endTime = performance.now()
    const duration = endTime - startTime

    this.metrics.set(`${key}_duration`, duration)
    this.metrics.delete(`${key}_start`)

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`Slow operation "${key}": ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static getMetric(key: string): number | undefined {
    return this.metrics.get(key)
  }

  static getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics.entries())
  }
}

// HOC for performance monitoring
export function withPerformanceMonitoring<T extends object>(
  Component: ComponentType<T>,
  componentName: string
) {
  return React.memo(function MonitoredComponent(props: T) {
    React.useEffect(() => {
      PerformanceMonitor.startTiming(`${componentName}_render`)

      return () => {
        PerformanceMonitor.endTiming(`${componentName}_render`)
      }
    })

    return <Component {...props} />
  })
}

// Image lazy loading utility
export function LazyImage({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAyNEwxNiAzMlYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: string
}) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [imageSrc, setImageSrc] = React.useState(placeholder)
  const [ref, isIntersecting] = useIntersectionObserver()

  React.useEffect(() => {
    if (isIntersecting && !isLoaded) {
      setImageSrc(src!)
    }
  }, [isIntersecting, src, isLoaded])

  return (
    <div ref={ref} className={className}>
      <Image
        {...props}
        src={imageSrc}
        alt={alt || ''}
        className={className}
        onLoad={() => setIsLoaded(true)}
        width={0}
        height={0}
        loading="lazy"
      />
    </div>
  )
}

// Optimistic update utility
export function useOptimisticUpdate<T>(
  initialState: T,
  updateFn: (state: T, optimisticUpdate: Partial<T>) => T
) {
  const [state, setState] = React.useState(initialState)
  const [pendingUpdates, setPendingUpdates] = React.useState<Set<string>>(new Set())

  const applyOptimistic = React.useCallback(
    (id: string, update: Partial<T>) => {
      setState(prevState => updateFn(prevState, update))
      setPendingUpdates(prev => new Set(Array.from(prev).concat([id])))
    },
    [updateFn]
  )

  const confirmUpdate = React.useCallback((id: string, confirmedState?: T) => {
    setPendingUpdates(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

    if (confirmedState) {
      setState(confirmedState)
    }
  }, [])

  const revertUpdate = React.useCallback((id: string, revertedState: T) => {
    setPendingUpdates(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setState(revertedState)
  }, [])

  return {
    state,
    applyOptimistic,
    confirmUpdate,
    revertUpdate,
    hasPendingUpdates: pendingUpdates.size > 0,
  }
}
