'use client'

/**
 * Currency Context Provider for Moneytor V2
 * Manages global currency state and settings throughout the application
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useUser } from '@/hooks/use-user'
import { getUserProfileWithSettings, updateUserSettings } from '@/lib/supabase/settings'
import { 
  Currency, 
  getCurrencyByCode, 
  getDefaultCurrency, 
  formatCurrency as formatCurrencyUtil,
  getCurrencySymbol,
  getCurrencyPosition,
  formatCurrencyWithColor,
  formatCurrencyForChart,
  parseCurrency 
} from '@/lib/utils/currency'
import type { UserProfileWithSettings } from '@/types/settings'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

interface CurrencyContextType {
  // Current currency state
  currency: Currency
  userProfile: UserProfileWithSettings | null
  isLoading: boolean
  
  // Currency operations
  setCurrency: (currencyCode: string) => Promise<void>
  formatCurrency: (amount: number, options?: {
    showSymbol?: boolean
    decimals?: number
    locale?: string
  }) => string
  formatCurrencyWithColor: (
    amount: number,
    type?: 'income' | 'expense' | 'neutral'
  ) => { formatted: string; colorClass: string }
  formatCurrencyForChart: (amount: number, compact?: boolean) => string
  parseCurrency: (value: string) => number
  getCurrencySymbol: () => string
  getCurrencyPosition: () => 'left' | 'right'
  
  // Utility methods
  refreshProfile: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

interface CurrencyProviderProps {
  children: React.ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for user profile with settings
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => getUserProfileWithSettings(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.data,
  })

  // Mutation for updating currency
  const updateCurrencyMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const result = await updateUserSettings(user.id, { currency: currencyCode })
      if (result.error) throw new Error(result.error)
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile', user?.id], data)
      toast({
        title: 'Currency updated',
        description: 'Your currency preference has been saved.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update currency',
        description: error.message,
      })
    },
  })

  // Get current currency
  const currency = useMemo(() => {
    if (userProfile?.preferences?.currency) {
      return getCurrencyByCode(userProfile.preferences.currency) || getDefaultCurrency()
    }
    if (userProfile?.currency) {
      return getCurrencyByCode(userProfile.currency) || getDefaultCurrency()
    }
    return getDefaultCurrency()
  }, [userProfile])

  // Currency operations
  const setCurrency = useCallback(async (currencyCode: string) => {
    if (!getCurrencyByCode(currencyCode)) {
      toast({
        variant: 'destructive',
        title: 'Invalid currency',
        description: 'Please select a valid currency code.',
      })
      return
    }
    
    await updateCurrencyMutation.mutateAsync(currencyCode)
  }, [updateCurrencyMutation, toast])

  const formatCurrency = useCallback((
    amount: number,
    options?: {
      showSymbol?: boolean
      decimals?: number
      locale?: string
    }
  ) => {
    return formatCurrencyUtil(amount, currency.code, options)
  }, [currency.code])

  const formatCurrencyWithColorWrapper = useCallback((
    amount: number,
    type: 'income' | 'expense' | 'neutral' = 'neutral'
  ) => {
    return formatCurrencyWithColor(amount, currency.code, type)
  }, [currency.code])

  const formatCurrencyForChartWrapper = useCallback((
    amount: number,
    compact: boolean = false
  ) => {
    return formatCurrencyForChart(amount, currency.code, compact)
  }, [currency.code])

  const parseCurrencyWrapper = useCallback((value: string) => {
    return parseCurrency(value, currency.code)
  }, [currency.code])

  const getCurrencySymbolWrapper = useCallback(() => {
    return getCurrencySymbol(currency.code)
  }, [currency.code])

  const getCurrencyPositionWrapper = useCallback(() => {
    return getCurrencyPosition(currency.code)
  }, [currency.code])

  const refreshProfile = useCallback(async () => {
    await refetchProfile()
  }, [refetchProfile])

  // Loading state
  const isLoading = isProfileLoading || updateCurrencyMutation.isPending

  // Context value
  const contextValue: CurrencyContextType = useMemo(() => ({
    currency,
    userProfile: userProfile || null,
    isLoading,
    setCurrency,
    formatCurrency,
    formatCurrencyWithColor: formatCurrencyWithColorWrapper,
    formatCurrencyForChart: formatCurrencyForChartWrapper,
    parseCurrency: parseCurrencyWrapper,
    getCurrencySymbol: getCurrencySymbolWrapper,
    getCurrencyPosition: getCurrencyPositionWrapper,
    refreshProfile,
  }), [
    currency,
    userProfile,
    isLoading,
    setCurrency,
    formatCurrency,
    formatCurrencyWithColorWrapper,
    formatCurrencyForChartWrapper,
    parseCurrencyWrapper,
    getCurrencySymbolWrapper,
    getCurrencyPositionWrapper,
    refreshProfile,
  ])

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  )
}

/**
 * Hook to use currency context
 */
export function useCurrency() {
  const context = useContext(CurrencyContext)
  
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  
  return context
}

/**
 * Higher-order component to provide currency context
 */
export function withCurrency<P extends object>(Component: React.ComponentType<P>) {
  return function CurrencyWrappedComponent(props: P) {
    return (
      <CurrencyProvider>
        <Component {...props} />
      </CurrencyProvider>
    )
  }
}

/**
 * Hook for currency formatting only (lightweight)
 */
export function useCurrencyFormatter() {
  const { formatCurrency, formatCurrencyWithColor, formatCurrencyForChart, parseCurrency } = useCurrency()
  
  return {
    formatCurrency,
    formatCurrencyWithColor,
    formatCurrencyForChart,
    parseCurrency,
  }
}

/**
 * Hook for currency symbol and position (lightweight)
 */
export function useCurrencyInfo() {
  const { currency, getCurrencySymbol, getCurrencyPosition } = useCurrency()
  
  return {
    currency,
    symbol: getCurrencySymbol(),
    position: getCurrencyPosition(),
  }
}