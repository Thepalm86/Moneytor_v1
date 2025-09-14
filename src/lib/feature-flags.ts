/**
 * Feature Flag System for Moneytor V2
 * Enables gradual rollout and A/B testing of new features
 */

export interface FeatureFlags {
  SETTINGS_REDESIGN: boolean
  SETTINGS_ADVANCED_SEARCH: boolean
  SETTINGS_QUICK_ACTIONS: boolean
  SETTINGS_BULK_OPERATIONS: boolean
}

export interface FeatureFlagConfig {
  enabled: boolean
  rolloutPercentage?: number
  userGroups?: string[]
  description: string
}

// Default feature flag configuration
const defaultFlags: Record<keyof FeatureFlags, FeatureFlagConfig> = {
  SETTINGS_REDESIGN: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'New redesigned settings page with improved UX',
  },
  SETTINGS_ADVANCED_SEARCH: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Enhanced search and filtering in settings',
  },
  SETTINGS_QUICK_ACTIONS: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Quick actions panel for common settings tasks',
  },
  SETTINGS_BULK_OPERATIONS: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Bulk import/export and reset operations',
  },
}

// Environment-based feature flag overrides
const getEnvironmentFlags = (): Partial<Record<keyof FeatureFlags, FeatureFlagConfig>> => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isPreview = process.env.VERCEL_ENV === 'preview'
  
  // Enable all flags in development and preview environments
  if (isDevelopment || isPreview) {
    return {
      SETTINGS_REDESIGN: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Development/Preview: Settings redesign enabled',
      },
      SETTINGS_ADVANCED_SEARCH: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Development/Preview: Advanced search enabled',
      },
      SETTINGS_QUICK_ACTIONS: {
        enabled: true,
        rolloutPercentage: 100,
        description: 'Development/Preview: Quick actions enabled',
      },
    }
  }

  // Production environment overrides (can be controlled via environment variables)
  return {
    SETTINGS_REDESIGN: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_SETTINGS_REDESIGN === 'true',
      rolloutPercentage: parseInt(process.env.NEXT_PUBLIC_SETTINGS_REDESIGN_ROLLOUT || '0'),
      description: 'Production: Settings redesign controlled rollout',
    },
  }
}

// Merge default flags with environment overrides
const mergeFlags = (): Record<keyof FeatureFlags, FeatureFlagConfig> => {
  const envFlags = getEnvironmentFlags()
  const merged = { ...defaultFlags }
  
  Object.entries(envFlags).forEach(([key, value]) => {
    if (value) {
      merged[key as keyof FeatureFlags] = { ...merged[key as keyof FeatureFlags], ...value }
    }
  })
  
  return merged
}

// User-based feature flag evaluation
const evaluateUserFlags = (userId?: string, userGroups: string[] = []): FeatureFlags => {
  const flagConfigs = mergeFlags()
  const flags: FeatureFlags = {} as FeatureFlags
  
  Object.entries(flagConfigs).forEach(([flagName, config]) => {
    const flag = flagName as keyof FeatureFlags
    
    // If disabled globally, return false
    if (!config.enabled) {
      flags[flag] = false
      return
    }
    
    // Check user group restrictions
    if (config.userGroups && config.userGroups.length > 0) {
      const hasGroupAccess = config.userGroups.some(group => userGroups.includes(group))
      if (!hasGroupAccess) {
        flags[flag] = false
        return
      }
    }
    
    // Check rollout percentage
    if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
      if (!userId) {
        flags[flag] = false
        return
      }
      
      // Simple hash-based rollout (deterministic for same user)
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const userPercentile = hash % 100
      flags[flag] = userPercentile < config.rolloutPercentage
      return
    }
    
    // Default to enabled if all checks pass
    flags[flag] = true
  })
  
  return flags
}

// Hook for using feature flags in React components
export function useFeatureFlags(userId?: string, userGroups: string[] = []) {
  return evaluateUserFlags(userId, userGroups)
}

// Utility functions for specific feature checks
export function isSettingsRedesignEnabled(userId?: string, userGroups: string[] = []): boolean {
  const flags = evaluateUserFlags(userId, userGroups)
  return flags.SETTINGS_REDESIGN
}

export function isAdvancedSearchEnabled(userId?: string, userGroups: string[] = []): boolean {
  const flags = evaluateUserFlags(userId, userGroups)
  return flags.SETTINGS_ADVANCED_SEARCH
}

export function isQuickActionsEnabled(userId?: string, userGroups: string[] = []): boolean {
  const flags = evaluateUserFlags(userId, userGroups)
  return flags.SETTINGS_QUICK_ACTIONS
}

// Development utilities
export function getAllFlags(): Record<keyof FeatureFlags, FeatureFlagConfig> {
  return mergeFlags()
}

export function logFeatureFlags(userId?: string, userGroups: string[] = []) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚩 Feature Flags')
    console.log('User ID:', userId || 'Anonymous')
    console.log('User Groups:', userGroups)
    console.log('Active Flags:', evaluateUserFlags(userId, userGroups))
    console.log('All Flag Configs:', getAllFlags())
    console.groupEnd()
  }
}