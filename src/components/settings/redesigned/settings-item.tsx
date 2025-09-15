'use client'

/**
 * Settings Item Component - Redesigned
 * Individual setting component with unified interaction patterns
 * Supports all common setting types with consistent styling
 */

import { ReactNode, useState, useEffect } from 'react'
import { Check, X, Info, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface BaseSettingsItemProps {
  label: string
  description?: string
  helpText?: string
  helpLink?: string
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
  success?: string
}

export interface ToggleSettingsItemProps extends BaseSettingsItemProps {
  type: 'toggle'
  value: boolean
  onChange: (value: boolean) => void
  instantSave?: boolean
}

export interface SelectSettingsItemProps extends BaseSettingsItemProps {
  type: 'select'
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; description?: string }>
  placeholder?: string
  instantSave?: boolean
}

export interface InputSettingsItemProps extends BaseSettingsItemProps {
  type: 'input'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  inputType?: 'text' | 'email' | 'password' | 'number'
  maxLength?: number
  instantSave?: boolean
}

export interface ActionSettingsItemProps extends BaseSettingsItemProps {
  type: 'action'
  buttonText: string
  buttonVariant?: 'default' | 'outline' | 'destructive'
  onAction: () => void
  loading?: boolean
}

export interface DisplaySettingsItemProps extends BaseSettingsItemProps {
  type: 'display'
  value: ReactNode
  badge?: string
  actions?: ReactNode
}

type SettingsItemProps =
  | ToggleSettingsItemProps
  | SelectSettingsItemProps
  | InputSettingsItemProps
  | ActionSettingsItemProps
  | DisplaySettingsItemProps

export function SettingsItem(props: SettingsItemProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [localValue, setLocalValue] = useState<any>(
    props.type !== 'action' && props.type !== 'display' ? props.value : null
  )

  // Track changes for non-instant save items
  useEffect(() => {
    if (props.type === 'action' || props.type === 'display') return

    const hasChanges = localValue !== props.value
    setHasUnsavedChanges(hasChanges && !props.instantSave)
  }, [localValue, props])

  const handleChange = (newValue: any) => {
    if (props.type === 'action' || props.type === 'display') return

    setLocalValue(newValue)

    if (props.instantSave) {
      ;(props.onChange as any)(newValue)
    }
  }

  const handleSave = () => {
    if (props.type === 'action' || props.type === 'display') return
    ;(props.onChange as any)(localValue)
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    if (props.type === 'action' || props.type === 'display') return
    setLocalValue(props.value)
    setHasUnsavedChanges(false)
  }

  return (
    <div className={cn('space-y-3 sm:space-y-4', props.className)}>
      {/* Label and Description */}
      <div className="space-y-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label
            className={cn(
              'text-sm font-medium',
              props.disabled && 'text-gray-400',
              props.error && 'text-red-600'
            )}
          >
            {props.label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </Label>

          {props.type === 'display' && props.badge && (
            <span className="inline-flex items-center self-start rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              {props.badge}
            </span>
          )}
        </div>

        {props.description && (
          <p
            className={cn(
              'text-sm leading-relaxed text-gray-600',
              props.disabled && 'text-gray-400'
            )}
          >
            {props.description}
          </p>
        )}
      </div>

      {/* Setting Control */}
      <div className="space-y-3">
        {/* Toggle */}
        {props.type === 'toggle' && (
          <div className="flex items-center space-x-3">
            <Switch
              checked={props.instantSave ? props.value : localValue}
              onCheckedChange={handleChange}
              disabled={props.disabled}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={cn('text-sm', props.disabled ? 'text-gray-400' : 'text-gray-700')}>
              {(props.instantSave ? props.value : localValue) ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )}

        {/* Select */}
        {props.type === 'select' && (
          <Select
            value={props.instantSave ? props.value : localValue}
            onValueChange={handleChange}
            disabled={props.disabled}
          >
            <SelectTrigger
              className={cn(
                'w-full sm:max-w-xs',
                props.error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            >
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs leading-relaxed text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Input */}
        {props.type === 'input' && (
          <Input
            type={props.inputType || 'text'}
            value={props.instantSave ? props.value : localValue}
            onChange={e => handleChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            disabled={props.disabled}
            className={cn(
              'w-full sm:max-w-xs',
              props.error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
          />
        )}

        {/* Action */}
        {props.type === 'action' && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant={props.buttonVariant || 'outline'}
              onClick={props.onAction}
              disabled={props.disabled || props.loading}
              className="w-full sm:w-auto sm:max-w-xs"
            >
              {props.loading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {props.buttonText}
            </Button>
            {props.type === 'action' && props.helpLink && (
              <a
                href={props.helpLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 self-start text-sm text-blue-600 hover:text-blue-700 sm:self-center"
              >
                <span>Learn more</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Display */}
        {props.type === 'display' && (
          <div className="flex items-center justify-between">
            <div className="rounded-md border bg-gray-50 px-3 py-2 font-mono text-sm">
              {props.value}
            </div>
            {props.actions && <div className="flex items-center space-x-2">{props.actions}</div>}
          </div>
        )}

        {/* Unsaved Changes Actions */}
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span className="flex-1 text-sm text-amber-700">You have unsaved changes</span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs text-amber-700 hover:bg-amber-100"
              >
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="h-7 border-amber-300 text-xs text-amber-700 hover:bg-amber-100"
              >
                <Check className="mr-1 h-3 w-3" />
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {props.helpText && (
        <div className="flex items-start space-x-2 text-xs text-gray-500">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span>{props.helpText}</span>
          {props.helpLink && (
            <a
              href={props.helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <span>Learn more</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Status Messages */}
      {props.error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <X className="h-4 w-4 flex-shrink-0" />
          <span>{props.error}</span>
        </div>
      )}

      {props.success && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>{props.success}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Settings Item Separator - Visual separator between related settings
 */
export function SettingsItemSeparator({ className }: { className?: string }) {
  return <hr className={cn('border-gray-100', className)} />
}
