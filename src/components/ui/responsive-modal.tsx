'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Import desktop modal components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

// Import mobile modal components
import {
  MobileModal,
  MobileModalContent,
  MobileModalDescription,
  MobileModalFooter,
  MobileModalHeader,
  MobileModalTitle,
  MobileModalTrigger,
  MobileModalClose,
  MobileBottomSheet,
  MobileActionSheet,
  MobileFormModal,
} from '@/components/ui/mobile-modal'

// Responsive Modal Root
interface ResponsiveModalProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  mobileVariant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet' | 'form'
}

const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
  mobileVariant = 'bottom-sheet',
}: ResponsiveModalProps) => {
  return (
    <>
      {/* Mobile Modal */}
      <div className="block lg:hidden">
        <MobileModal open={open} onOpenChange={onOpenChange}>
          {children}
        </MobileModal>
      </div>

      {/* Desktop Modal */}
      <div className="hidden lg:block">
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </div>
    </>
  )
}

// Responsive Modal Trigger
const ResponsiveModalTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof DialogTrigger>
>(({ children, ...props }, ref) => (
  <>
    {/* Mobile Trigger */}
    <div className="block lg:hidden">
      <MobileModalTrigger ref={ref} {...props}>
        {children}
      </MobileModalTrigger>
    </div>

    {/* Desktop Trigger */}
    <div className="hidden lg:block">
      <DialogTrigger ref={ref} {...props}>
        {children}
      </DialogTrigger>
    </div>
  </>
))
ResponsiveModalTrigger.displayName = 'ResponsiveModalTrigger'

// Responsive Modal Content
interface ResponsiveModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  mobileVariant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet' | 'form'
  showMobileHandle?: boolean
  mobileSwipeToClose?: boolean
}

const ResponsiveModalContent = React.forwardRef<HTMLDivElement, ResponsiveModalContentProps>(
  (
    {
      className,
      children,
      mobileVariant = 'bottom-sheet',
      showMobileHandle = true,
      mobileSwipeToClose = true,
      ...props
    },
    ref
  ) => {
    // Render appropriate mobile variant
    const renderMobileContent = () => {
      switch (mobileVariant) {
        case 'fullscreen':
          return (
            <MobileModalContent
              variant="fullscreen"
              swipeToClose={false}
              className={className}
              {...props}
            >
              {children}
            </MobileModalContent>
          )
        case 'bottom-sheet':
          return (
            <MobileBottomSheet
              showHandle={showMobileHandle}
              swipeToClose={mobileSwipeToClose}
              className={className}
              {...props}
            >
              {children}
            </MobileBottomSheet>
          )
        case 'action-sheet':
          return (
            <MobileActionSheet className={className} {...props}>
              {children}
            </MobileActionSheet>
          )
        case 'form':
          return (
            <MobileFormModal keyboardOptimized={true} className={className} {...props}>
              {children}
            </MobileFormModal>
          )
        default:
          return (
            <MobileBottomSheet
              showHandle={showMobileHandle}
              swipeToClose={mobileSwipeToClose}
              className={className}
              {...props}
            >
              {children}
            </MobileBottomSheet>
          )
      }
    }

    return (
      <>
        {/* Mobile Content */}
        <div className="block lg:hidden">{renderMobileContent()}</div>

        {/* Desktop Content */}
        <div className="hidden lg:block">
          <DialogContent ref={ref} className={className} {...props}>
            {children}
          </DialogContent>
        </div>
      </>
    )
  }
)
ResponsiveModalContent.displayName = 'ResponsiveModalContent'

// Responsive Modal Header
interface ResponsiveModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showMobileClose?: boolean
  mobileVariant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet' | 'form'
}

const ResponsiveModalHeader = React.forwardRef<HTMLDivElement, ResponsiveModalHeaderProps>(
  (
    { className, children, showMobileClose = true, mobileVariant = 'bottom-sheet', ...props },
    ref
  ) => (
    <>
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <MobileModalHeader
          ref={ref}
          showClose={showMobileClose}
          variant={mobileVariant === 'form' ? 'fullscreen' : mobileVariant}
          className={className}
          {...props}
        >
          {children}
        </MobileModalHeader>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DialogHeader className={className} {...props}>
          {children}
        </DialogHeader>
      </div>
    </>
  )
)
ResponsiveModalHeader.displayName = 'ResponsiveModalHeader'

// Responsive Modal Footer
interface ResponsiveModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  mobileVariant?: 'fullscreen' | 'bottom-sheet' | 'action-sheet' | 'form'
}

const ResponsiveModalFooter = React.forwardRef<HTMLDivElement, ResponsiveModalFooterProps>(
  ({ className, children, mobileVariant = 'bottom-sheet', ...props }, ref) => (
    <>
      {/* Mobile Footer */}
      <div className="block lg:hidden">
        <MobileModalFooter
          ref={ref}
          variant={mobileVariant === 'form' ? 'fullscreen' : mobileVariant}
          className={className}
          {...props}
        >
          {children}
        </MobileModalFooter>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <DialogFooter className={className} {...props}>
          {children}
        </DialogFooter>
      </div>
    </>
  )
)
ResponsiveModalFooter.displayName = 'ResponsiveModalFooter'

// Responsive Modal Title
const ResponsiveModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, children, ...props }, ref) => (
  <>
    {/* Mobile Title */}
    <div className="block lg:hidden">
      <MobileModalTitle ref={ref} className={className} {...props}>
        {children}
      </MobileModalTitle>
    </div>

    {/* Desktop Title */}
    <div className="hidden lg:block">
      <DialogTitle ref={ref} className={className} {...props}>
        {children}
      </DialogTitle>
    </div>
  </>
))
ResponsiveModalTitle.displayName = 'ResponsiveModalTitle'

// Responsive Modal Description
const ResponsiveModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogDescription>
>(({ className, children, ...props }, ref) => (
  <>
    {/* Mobile Description */}
    <div className="block lg:hidden">
      <MobileModalDescription ref={ref} className={className} {...props}>
        {children}
      </MobileModalDescription>
    </div>

    {/* Desktop Description */}
    <div className="hidden lg:block">
      <DialogDescription ref={ref} className={className} {...props}>
        {children}
      </DialogDescription>
    </div>
  </>
))
ResponsiveModalDescription.displayName = 'ResponsiveModalDescription'

// Responsive Modal Close
const ResponsiveModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof DialogClose>
>(({ children, ...props }, ref) => (
  <>
    {/* Mobile Close */}
    <div className="block lg:hidden">
      <MobileModalClose ref={ref} {...props}>
        {children}
      </MobileModalClose>
    </div>

    {/* Desktop Close */}
    <div className="hidden lg:block">
      <DialogClose ref={ref} {...props}>
        {children}
      </DialogClose>
    </div>
  </>
))
ResponsiveModalClose.displayName = 'ResponsiveModalClose'

// Convenience components for specific use cases

// Quick Action Modal - Bottom sheet on mobile, dialog on desktop
interface QuickActionModalProps extends ResponsiveModalProps {
  children: React.ReactNode
}

const QuickActionModal = ({ children, ...props }: QuickActionModalProps) => (
  <ResponsiveModal mobileVariant="bottom-sheet" {...props}>
    {children}
  </ResponsiveModal>
)

// Form Modal - Full screen on mobile, dialog on desktop
interface FormModalProps extends ResponsiveModalProps {
  children: React.ReactNode
}

const FormModal = ({ children, ...props }: FormModalProps) => (
  <ResponsiveModal mobileVariant="form" {...props}>
    {children}
  </ResponsiveModal>
)

// Selection Modal - Action sheet on mobile, dialog on desktop
interface SelectionModalProps extends ResponsiveModalProps {
  children: React.ReactNode
}

const SelectionModal = ({ children, ...props }: SelectionModalProps) => (
  <ResponsiveModal mobileVariant="action-sheet" {...props}>
    {children}
  </ResponsiveModal>
)

// Full Screen Modal - Full screen on mobile, dialog on desktop
interface FullScreenModalProps extends ResponsiveModalProps {
  children: React.ReactNode
}

const FullScreenModal = ({ children, ...props }: FullScreenModalProps) => (
  <ResponsiveModal mobileVariant="fullscreen" {...props}>
    {children}
  </ResponsiveModal>
)

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
  QuickActionModal,
  FormModal,
  SelectionModal,
  FullScreenModal,
}
