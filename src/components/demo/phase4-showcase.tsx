'use client'

import { useState } from 'react'

import { Input, FloatingInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Phase 4 UI/UX Showcase Component
 *
 * Demonstrates all the enhanced form components and interactions:
 * - Floating label inputs with smooth animations
 * - Enhanced select dropdowns with glass morphism
 * - Premium dialog modals with backdrop blur
 * - Skeleton loading states
 * - Micro-interactions throughout
 */
export function Phase4Showcase() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const toggleSkeleton = () => {
    setShowSkeleton(prev => !prev)
    setTimeout(() => setShowSkeleton(false), 3000)
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="space-y-4 text-center">
        <h1 className="text-display-lg gradient-primary bg-clip-text text-transparent">
          Phase 4: Form Design & Interactions
        </h1>
        <p className="text-body-lg mx-auto max-w-2xl text-muted-foreground">
          Enhanced form components with floating labels, glass morphism effects, micro-interactions,
          and premium loading states.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Enhanced Form Components */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Enhanced Form Components</CardTitle>
            <CardDescription>
              Floating labels, glass morphism, and smooth animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regular Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Regular Enhanced Input</label>
              <Input placeholder="Enter your name" className="animate-fade-in" />
            </div>

            {/* Floating Label Input */}
            <FloatingInput label="Email Address" type="email" className="animate-slide-up" />

            <FloatingInput
              label="Phone Number"
              type="tel"
              error="Please enter a valid phone number"
            />

            {/* Enhanced Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enhanced Select</label>
              <Select>
                <SelectTrigger className="animate-scale-in">
                  <SelectValue placeholder="Choose your category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">🍕 Food & Dining</SelectItem>
                  <SelectItem value="transport">🚗 Transportation</SelectItem>
                  <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                  <SelectItem value="bills">💡 Bills & Utilities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1" onClick={simulateLoading} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit Form'}
              </Button>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dialog & Modal Enhancements */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Dialog & Modal Enhancements</CardTitle>
            <CardDescription>Glass morphism modals with backdrop blur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="gradient" size="lg" className="w-full">
                  Open Premium Dialog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-display-sm">Premium Dialog Experience</DialogTitle>
                  <DialogDescription>
                    This dialog features glass morphism effects, backdrop blur, and enhanced
                    animations for a premium user experience.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <FloatingInput label="Your Name" />
                  <FloatingInput label="Email Address" type="email" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-3">
                    <Button className="flex-1">Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="secondary" size="lg" className="w-full" onClick={toggleSkeleton}>
              Toggle Loading States
            </Button>
          </CardContent>
        </Card>

        {/* Loading States & Skeletons */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Loading States & Skeleton Animations</CardTitle>
            <CardDescription>Premium skeleton loading with smooth animations</CardDescription>
          </CardHeader>
          <CardContent>
            {showSkeleton ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Form Skeleton</h3>
                  <FormSkeleton />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium">Card Skeleton</h3>
                  <CardSkeleton />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium">Table Skeleton</h3>
                  <TableSkeleton rows={3} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-4 text-muted-foreground">
                  Click "Toggle Loading States" to see skeleton animations
                </p>
                <div className="flex justify-center gap-4">
                  <div className="h-4 w-4 animate-bounce-gentle rounded-full bg-primary" />
                  <div className="h-4 w-4 animate-bounce-gentle rounded-full bg-primary delay-100" />
                  <div className="h-4 w-4 animate-bounce-gentle rounded-full bg-primary delay-200" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Animation Examples */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Micro-Interactions & Animations</CardTitle>
          <CardDescription>Hover over elements to see the enhanced interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button className="interactive-hover" variant="default">
              Hover Effect
            </Button>
            <Button className="interactive-hover" variant="success">
              Success Button
            </Button>
            <Button className="interactive-hover" variant="warning">
              Warning Button
            </Button>
            <Button className="interactive-hover" variant="gradient">
              Gradient Button
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
