'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(value)
  const sliderRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleMouseDown = (event: React.MouseEvent, index: number) => {
    event.preventDefault()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return
      
      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
      const newValue = min + percentage * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      
      const newValues = [...internalValue]
      newValues[index] = Math.min(Math.max(steppedValue, min), max)
      
      // Ensure proper ordering
      if (index === 0 && newValues[0] > newValues[1]) {
        newValues[0] = newValues[1]
      } else if (index === 1 && newValues[1] < newValues[0]) {
        newValues[1] = newValues[0]
      }
      
      setInternalValue(newValues)
      onValueChange(newValues)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  return (
    <div className={cn('relative flex items-center select-none touch-none', className)}>
      <div
        ref={sliderRef}
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 cursor-pointer"
      >
        {/* Track fill */}
        <div
          className="absolute h-full bg-blue-600 rounded-full"
          style={{
            left: `${getPercentage(internalValue[0])}%`,
            width: `${getPercentage(internalValue[1]) - getPercentage(internalValue[0])}%`
          }}
        />
        
        {/* Thumb 1 */}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-blue-600 cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
          style={{ left: `${getPercentage(internalValue[0])}%` }}
          onMouseDown={(e) => handleMouseDown(e, 0)}
        />
        
        {/* Thumb 2 */}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-blue-600 cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
          style={{ left: `${getPercentage(internalValue[1])}%` }}
          onMouseDown={(e) => handleMouseDown(e, 1)}
        />
      </div>
    </div>
  )
}