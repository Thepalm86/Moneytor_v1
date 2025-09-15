'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, ChevronDown, Grip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSwipeGesture } from '@/components/ui/mobile-gestures'

// Mobile Modal Root Components
const MobileModal = DialogPrimitive.Root
const MobileModalTrigger = DialogPrimitive.Trigger
const MobileModalPortal = DialogPrimitive.Portal
const MobileModalClose = DialogPrimitive.Close

// Enhanced Mobile Overlay with blur and fade
const MobileModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-all duration-300',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
MobileModalOverlay.displayName = DialogPrimitive.Overlay.displayName

// Full Screen Mobile Modal - Takes full viewport height with safe area
interface MobileModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet'
  showHandle?: boolean
  swipeToClose?: boolean
}

const MobileModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MobileModalContentProps
>(
  (
    {
      className,
      children,
      variant = 'fullscreen',
      showHandle = false,
      swipeToClose = true,
      ...props
    },
    ref
  ) => {
    const [isPanning, setIsPanning] = React.useState(false)
    const [translateY, setTranslateY] = React.useState(0)
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Gesture handlers for swipe-to-dismiss
    const swipeHandlers = useSwipeGesture({
      onSwipeStart: () => {
        if (swipeToClose && variant !== 'fullscreen') {
          setIsPanning(true)
        }
      },
      onSwipeMove: delta => {
        const deltaY = typeof delta === 'number' ? delta : delta.y
        if (swipeToClose && variant !== 'fullscreen' && isPanning && deltaY > 0) {
          // Only allow downward swipes
          setTranslateY(Math.min(deltaY * 0.7, 200)) // Add resistance
        }
      },
      onSwipeEnd: (deltaY, velocity) => {
        if (swipeToClose && variant !== 'fullscreen' && isPanning) {
          setIsPanning(false)

          // Dismiss if swiped down far enough or with sufficient velocity
          if (deltaY > 120 || velocity > 0.5) {
            // Trigger close via the DialogPrimitive
            const closeButton = contentRef.current?.querySelector(
              '[data-dismiss-trigger]'
            ) as HTMLElement
            closeButton?.click()
          } else {
            // Snap back to original position
            setTranslateY(0)
          }
        }
      },
      threshold: 10,
    })

    // Variant-specific styling
    const getVariantClasses = () => {
      switch (variant) {
        case 'fullscreen':
          return 'fixed inset-0 z-50 bg-white'
        case 'bottom-sheet':
          return 'fixed inset-x-0 bottom-0 z-50 max-h-[90vh] rounded-t-3xl bg-white'
        case 'action-sheet':
          return 'fixed inset-x-4 bottom-4 z-50 max-h-[80vh] rounded-2xl bg-white'
        default:
          return 'fixed inset-0 z-50 bg-white'
      }
    }

    // Animation classes based on variant
    const getAnimationClasses = () => {
      switch (variant) {
        case 'fullscreen':
          return cn(
            'duration-300 ease-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
          )
        case 'bottom-sheet':
          return cn(
            'duration-300 ease-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
          )
        case 'action-sheet':
          return cn(
            'duration-200 ease-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100'
          )
        default:
          return ''
      }
    }

    return (
      <MobileModalPortal>
        <MobileModalOverlay />
        <DialogPrimitive.Content
          ref={ref}
          {...(swipeToClose && variant !== 'fullscreen' ? swipeHandlers : {})}
          className={cn(
            getVariantClasses(),
            getAnimationClasses(),
            // Transform for gesture handling
            isPanning && 'transition-none',
            className
          )}
          style={{
            transform:
              swipeToClose && variant !== 'fullscreen' && translateY > 0
                ? `translateY(${translateY}px)`
                : undefined,
          }}
          {...props}
        >
          <div ref={contentRef} className="flex h-full flex-col">
            {/* Handle bar for bottom sheet and action sheet */}
            {showHandle && variant !== 'fullscreen' && (
              <div className="flex justify-center py-3">
                <div className="h-1 w-12 rounded-full bg-gray-300" />
              </div>
            )}

            {/* Content wrapper with proper scrolling */}
            <div
              className={cn(
                'flex-1 overflow-y-auto',
                variant === 'fullscreen' && 'safe-area-padding',
                variant !== 'fullscreen' && 'px-4 pb-4'
              )}
            >
              {children}
            </div>

            {/* Hidden close trigger for gesture dismissal */}
            <DialogPrimitive.Close data-dismiss-trigger className="sr-only" aria-hidden="true" />
          </div>
        </DialogPrimitive.Content>
      </MobileModalPortal>
    )
  }
)
MobileModalContent.displayName = 'MobileModalContent'

// Mobile Modal Header with improved spacing and accessibility
const MobileModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    showClose?: boolean
    variant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet'
  }
>(({ className, children, showClose = true, variant = 'fullscreen', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between border-b border-gray-200/50 pb-4',
      variant === 'fullscreen' && 'safe-area-padding-top px-4 pt-4',
      variant !== 'fullscreen' && 'pt-2',
      className
    )}
    {...props}
  >
    <div className="flex-1 pr-4">{children}</div>

    {showClose && (
      <DialogPrimitive.Close className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200/50 bg-gray-50/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:ring-offset-2">
        <X className="h-5 w-5 text-gray-600" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    )}
  </div>
))
MobileModalHeader.displayName = 'MobileModalHeader'

// Mobile Modal Footer with safe area padding
const MobileModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet'
  }
>(({ className, variant = 'fullscreen', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col gap-3 border-t border-gray-200/50 pt-4',
      variant === 'fullscreen' && 'safe-area-padding-bottom px-4 pb-4',
      variant !== 'fullscreen' && 'pb-2',
      className
    )}
    {...props}
  />
))
MobileModalFooter.displayName = 'MobileModalFooter'

// Mobile Modal Title with improved typography
const MobileModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl',
      className
    )}
    {...props}
  />
))
MobileModalTitle.displayName = DialogPrimitive.Title.displayName

// Mobile Modal Description with better readability
const MobileModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('mt-2 text-base leading-relaxed text-gray-600', className)}
    {...props}
  />
))
MobileModalDescription.displayName = DialogPrimitive.Description.displayName

// Bottom Sheet Variant - Optimized for mobile forms and quick actions
const MobileBottomSheet = React.forwardRef<
  React.ElementRef<typeof MobileModalContent>,
  MobileModalContentProps
>(({ className, ...props }, ref) => (
  <MobileModalContent
    ref={ref}
    variant="bottom-sheet"
    showHandle={true}
    swipeToClose={true}
    className={cn(
      'shadow-2xl ring-1 ring-gray-200/20',
      // Glassmorphism effect
      'before:absolute before:inset-0 before:-z-10 before:rounded-t-3xl before:bg-gradient-to-br before:from-white/20 before:to-white/10',
      className
    )}
    {...props}
  />
))
MobileBottomSheet.displayName = 'MobileBottomSheet'

// Action Sheet Variant - iOS-style selection modals
const MobileActionSheet = React.forwardRef<
  React.ElementRef<typeof MobileModalContent>,
  MobileModalContentProps
>(({ className, ...props }, ref) => (
  <MobileModalContent
    ref={ref}
    variant="action-sheet"
    showHandle={false}
    swipeToClose={false}
    className={cn(
      'shadow-2xl ring-1 ring-gray-200/20',
      // Glassmorphism effect
      'before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-white/10',
      className
    )}
    {...props}
  />
))
MobileActionSheet.displayName = 'MobileActionSheet'

// Form Modal - Specialized for mobile form input with keyboard optimization
interface MobileFormModalProps extends MobileModalContentProps {
  keyboardOptimized?: boolean
}

const MobileFormModal = React.forwardRef<
  React.ElementRef<typeof MobileModalContent>,
  MobileFormModalProps
>(({ className, keyboardOptimized = true, ...props }, ref) => {
  React.useEffect(() => {
    if (keyboardOptimized) {
      // Prevent viewport zoom on input focus
      const viewport = document.querySelector('meta[name=viewport]')
      const originalContent = viewport?.getAttribute('content')

      if (viewport) {
        viewport.setAttribute('content', originalContent + ', user-scalable=no')

        return () => {
          if (originalContent) {
            viewport.setAttribute('content', originalContent)
          }
        }
      }
    }
  }, [keyboardOptimized])

  return (
    <MobileModalContent
      ref={ref}
      variant="fullscreen"
      swipeToClose={false}
      className={cn('bg-gray-50', keyboardOptimized && 'keyboard-optimized', className)}
      {...props}
    />
  )
})
MobileFormModal.displayName = 'MobileFormModal'

export {
  MobileModal,
  MobileModalPortal,
  MobileModalOverlay,
  MobileModalClose,
  MobileModalTrigger,
  MobileModalContent,
  MobileModalHeader,
  MobileModalFooter,
  MobileModalTitle,
  MobileModalDescription,
  MobileBottomSheet,
  MobileActionSheet,
  MobileFormModal,
}
