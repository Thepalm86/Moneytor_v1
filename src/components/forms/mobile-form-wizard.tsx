'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MobileCard } from '@/components/ui/mobile-card'
import { MobileNavigationHeader } from '@/components/ui/mobile-navigation-enhanced'
import { useSwipeGesture } from '@/components/ui/mobile-gestures'

interface MobileFormWizardStep {
  id: string
  title: string
  description?: string
  component: React.ReactNode
  isValid?: boolean
  isOptional?: boolean
}

interface MobileFormWizardProps {
  steps: MobileFormWizardStep[]
  currentStepId: string
  onStepChange: (stepId: string) => void
  onComplete: () => void
  onCancel?: () => void
  className?: string
  enableSwipeNavigation?: boolean
  showProgress?: boolean
}

export function MobileFormWizard({
  steps,
  currentStepId,
  onStepChange,
  onComplete,
  onCancel,
  className,
  enableSwipeNavigation = true,
  showProgress = true,
}: MobileFormWizardProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId)
  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const canGoNext = currentStep?.isValid !== false || currentStep?.isOptional
  const canGoPrevious = !isFirstStep

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else if (canGoNext) {
      onStepChange(steps[currentStepIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (canGoPrevious) {
      onStepChange(steps[currentStepIndex - 1].id)
    }
  }

  // Swipe gesture handlers
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: enableSwipeNavigation && canGoNext ? handleNext : undefined,
    onSwipeRight: enableSwipeNavigation && canGoPrevious ? handlePrevious : undefined,
    threshold: 100,
  })

  if (!currentStep) {
    return null
  }

  return (
    <div className={cn('flex flex-col h-full', className)} {...swipeHandlers}>
      {/* Header with navigation */}
      <MobileNavigationHeader
        title={currentStep.title}
        subtitle={currentStep.description}
        showBackButton={canGoPrevious}
        onBack={handlePrevious}
        enableSwipeBack={enableSwipeNavigation}
        rightAction={
          onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )
        }
      />

      {/* Progress indicator */}
      {showProgress && (
        <div className="px-4 py-3 border-b border-gray-200/50 bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex-1 h-2 rounded-full transition-colors duration-200',
                  index < currentStepIndex
                    ? 'bg-green-500' // Completed
                    : index === currentStepIndex
                    ? 'bg-blue-500' // Current
                    : 'bg-gray-200' // Upcoming
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-4">
        <MobileCard variant="flat" className="h-full">
          {currentStep.component}
        </MobileCard>
      </div>

      {/* Navigation buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200/50 p-4">
        <div className="flex gap-3">
          {canGoPrevious && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
              size="lg"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              'flex-1',
              !canGoPrevious && 'ml-0'
            )}
            size="lg"
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Swipe hint */}
        {enableSwipeNavigation && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Swipe left or right to navigate
          </p>
        )}
      </div>
    </div>
  )
}

// Step indicator component
interface MobileStepIndicatorProps {
  steps: Array<{
    id: string
    title: string
    isCompleted?: boolean
    isCurrent?: boolean
  }>
  className?: string
}

export function MobileStepIndicator({ steps, className }: MobileStepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-4', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {index > 0 && (
            <div className={cn(
              'flex-1 h-px',
              steps[index - 1].isCompleted ? 'bg-green-500' : 'bg-gray-300'
            )} />
          )}
          
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
              step.isCompleted
                ? 'bg-green-500 text-white'
                : step.isCurrent
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            )}
          >
            {step.isCompleted ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

// Form step wrapper
interface MobileFormStepProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function MobileFormStep({ 
  title, 
  description, 
  children, 
  className 
}: MobileFormStepProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export type { MobileFormWizardStep, MobileFormWizardProps, MobileStepIndicatorProps, MobileFormStepProps }