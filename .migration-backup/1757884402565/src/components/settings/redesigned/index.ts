/**
 * Redesigned Settings Components - Export Index
 * Clean, simplified components for the new settings experience
 * Maintains zero breaking changes with existing codebase
 */

// Core Components
export { SettingsHeader, SettingsHeaderAction, SettingsBreadcrumb } from './settings-header'
export { 
  SettingsGroup, 
  SettingsSubgroup, 
  SettingsGroupGrid, 
  SettingsGroupAction 
} from './settings-group'
export { SettingsItem, SettingsItemSeparator } from './settings-item'

// Search & Navigation
export { SettingsSearch, useSearchableSettings } from './settings-search'
export type { SearchableSettingItem } from './settings-search'

// Quick Actions
export { QuickActions, QuickActionsGrid } from './quick-actions'

// Form Components and Patterns
export {
  FormField,
  FormSection,
  FormActions,
  SettingsForm,
  ChangeIndicator,
  SettingsValue,
  QuickToggle,
  formValidation,
  useFormValidation,
} from './form-patterns'

// Main Page Component
export { default as SettingsPageRedesigned } from './settings-page-redesigned'

// Re-export types for convenience
export type {
  ToggleSettingsItemProps,
  SelectSettingsItemProps,
  InputSettingsItemProps,
  ActionSettingsItemProps,
  DisplaySettingsItemProps,
} from './settings-item'