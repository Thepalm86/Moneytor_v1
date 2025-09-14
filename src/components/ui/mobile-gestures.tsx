'use client'

import * as React from 'react'

// Types for gesture handling
interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  touchStartThreshold?: number
}

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  refreshThreshold?: number
  enabled?: boolean
}

// Swipe gesture hook
export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    touchStartThreshold = 10,
  } = options

  const touchStart = React.useRef<{ x: number; y: number } | null>(null)
  const touchEnd = React.useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    touchEnd.current = null
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    touchEnd.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Ignore small movements
    if (absDeltaX < touchStartThreshold && absDeltaY < touchStartThreshold) return

    // Determine swipe direction - prioritize the larger delta
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }

    // Reset
    touchStart.current = null
    touchEnd.current = null
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, touchStartThreshold])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

// Pull to refresh hook
export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, refreshThreshold = 80, enabled = true } = options
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  
  const touchStart = React.useRef<{ y: number } | null>(null)
  const scrollElement = React.useRef<HTMLElement | null>(null)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return
    
    const element = e.currentTarget as HTMLElement
    scrollElement.current = element
    
    // Only trigger pull-to-refresh when at the top of the container
    if (element.scrollTop <= 0) {
      touchStart.current = { y: e.touches[0].clientY }
    }
  }, [enabled, isRefreshing])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing || !touchStart.current || !scrollElement.current) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStart.current.y

    // Only allow pulling down when at top
    if (scrollElement.current.scrollTop <= 0 && deltaY > 0) {
      e.preventDefault() // Prevent default scroll behavior
      const distance = Math.min(deltaY * 0.5, refreshThreshold * 1.5) // Add resistance
      setPullDistance(distance)
    }
  }, [enabled, isRefreshing, refreshThreshold])

  const handleTouchEnd = React.useCallback(async () => {
    if (!enabled || isRefreshing || !touchStart.current) return

    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
    touchStart.current = null
  }, [enabled, isRefreshing, pullDistance, refreshThreshold, onRefresh])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isRefreshing,
    pullDistance,
    shouldShowIndicator: pullDistance > 20 || isRefreshing,
  }
}

// Swipe action component for list items
interface SwipeActionProps {
  children: React.ReactNode
  leftActions?: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
    className?: string
    color?: 'destructive' | 'success' | 'warning' | 'primary'
  }>
  rightActions?: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
    className?: string
    color?: 'destructive' | 'success' | 'warning' | 'primary'
  }>
  threshold?: number
  className?: string
}

export function SwipeAction({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeActionProps) {
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const touchStart = React.useRef<{ x: number } | null>(null)

  const colorClasses = {
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    primary: 'bg-blue-500 text-white',
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStart.current = { x: e.touches[0].clientX }
    setIsAnimating(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current || e.touches.length !== 1) return

    const deltaX = e.touches[0].clientX - touchStart.current.x
    const maxSwipe = 120 // Maximum swipe distance
    
    // Constrain swipe based on available actions
    let constrainedDelta = deltaX
    if (deltaX > 0 && leftActions.length === 0) constrainedDelta = 0
    if (deltaX < 0 && rightActions.length === 0) constrainedDelta = 0
    
    constrainedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, constrainedDelta))
    setSwipeOffset(constrainedDelta)
  }

  const handleTouchEnd = () => {
    if (!touchStart.current) return

    setIsAnimating(true)
    
    // Snap to action threshold or return to center
    if (Math.abs(swipeOffset) >= threshold) {
      // Keep at action position
      const direction = swipeOffset > 0 ? 1 : -1
      setSwipeOffset(direction * threshold)
    } else {
      // Return to center
      setSwipeOffset(0)
    }

    touchStart.current = null
  }

  const executeAction = (action: SwipeActionProps['leftActions'][0]) => {
    action.onClick()
    setSwipeOffset(0)
    setIsAnimating(true)
  }

  const renderActions = (actions: SwipeActionProps['leftActions'], side: 'left' | 'right') => {
    if (actions.length === 0) return null

    const isVisible = side === 'left' ? swipeOffset > 0 : swipeOffset < 0
    if (!isVisible) return null

    return (
      <div
        className={`absolute top-0 h-full flex items-center ${
          side === 'left' ? 'left-0' : 'right-0'
        }`}
        style={{
          width: Math.abs(swipeOffset),
        }}
      >
        {actions.map((action, index) => {
          const ActionIcon = action.icon
          return (
            <button
              key={index}
              onClick={() => executeAction(action)}
              className={`h-full px-4 flex items-center justify-center transition-colors ${
                colorClasses[action.color || 'primary']
              } ${action.className || ''}`}
              style={{ width: Math.abs(swipeOffset) / actions.length }}
            >
              <div className="text-center">
                <ActionIcon className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {renderActions(leftActions, 'left')}
      {renderActions(rightActions, 'right')}
      
      <div
        className={`relative z-10 ${isAnimating ? 'transition-transform duration-300 ease-out' : ''}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// Pull to refresh indicator component
interface PullToRefreshIndicatorProps {
  distance: number
  isRefreshing: boolean
  threshold: number
  className?: string
}

export function PullToRefreshIndicator({
  distance,
  isRefreshing,
  threshold,
  className,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(distance / threshold, 1)
  const scale = Math.min(0.6 + (progress * 0.4), 1)

  return (
    <div
      className={`absolute top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200 ${className || ''}`}
      style={{
        transform: `translateX(-50%) translateY(${Math.max(0, distance - 40)}px) scale(${scale})`,
        opacity: distance > 20 ? 1 : 0,
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200/50">
        {isRefreshing ? (
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
        ) : (
          <div
            className="h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full transition-transform duration-200"
            style={{
              transform: `rotate(${progress * 180}deg)`,
            }}
          />
        )}
      </div>
    </div>
  )
}

export type { SwipeGestureOptions, PullToRefreshOptions }