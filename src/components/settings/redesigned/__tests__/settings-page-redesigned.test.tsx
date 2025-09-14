/**
 * Tests for Settings Page Redesigned Component
 * Comprehensive test coverage for settings functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import SettingsPageRedesigned from '../settings-page-redesigned'
import { useSettings, useTimezones } from '@/hooks/use-settings'
import { useCurrency } from '@/contexts/currency-context'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/hooks/use-settings', () => ({
  useSettings: jest.fn(),
  useTimezones: jest.fn(),
}))

jest.mock('@/contexts/currency-context', () => ({
  useCurrency: jest.fn(),
}))

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Test data
const mockProfile = {
  id: 'test-user-id',
  full_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
}

const mockSettings = {
  currency: 'USD',
  timezone: 'America/New_York',
  date_format: 'MM/dd/yyyy',
  number_format: 'en-US',
  email_notifications: true,
  push_notifications: false,
  budget_alerts: true,
  goal_reminders: true,
  weekly_reports: false,
  two_factor_enabled: false,
  data_sharing: false,
  session_timeout: 60,
  data_retention: 365,
}

const mockTimezones = {
  data: [
    { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
    { value: 'America/New_York', label: 'EST - Eastern Standard Time' },
    { value: 'America/Los_Angeles', label: 'PST - Pacific Standard Time' },
  ],
  error: null,
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('SettingsPageRedesigned', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }

  const mockSearchParams = new URLSearchParams()

  const mockUpdateSettings = jest.fn()
  const mockUpdateProfile = jest.fn()
  const mockSetCurrency = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    
    ;(useSettings as jest.Mock).mockReturnValue({
      profile: mockProfile,
      settings: mockSettings,
      isLoading: false,
      updateSettings: mockUpdateSettings,
      updateProfile: mockUpdateProfile,
      isUpdatingSettings: false,
      isUpdatingProfile: false,
    })
    
    ;(useTimezones as jest.Mock).mockReturnValue(mockTimezones)
    
    ;(useCurrency as jest.Mock).mockReturnValue({
      currency: { code: 'USD', symbol: '$', name: 'US Dollar', position: 'left', locale: 'en-US' },
      setCurrency: mockSetCurrency,
    })
  })

  describe('Rendering', () => {
    it('renders the settings page with all sections', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Account & Profile')).toBeInTheDocument()
      expect(screen.getByText('App Preferences')).toBeInTheDocument()
      expect(screen.getByText('Notifications & Alerts')).toBeInTheDocument()
      expect(screen.getByText('Privacy & Data')).toBeInTheDocument()
    })

    it('shows loading state when data is loading', () => {
      ;(useSettings as jest.Mock).mockReturnValue({
        profile: null,
        settings: null,
        isLoading: true,
        updateSettings: mockUpdateSettings,
        updateProfile: mockUpdateProfile,
        isUpdatingSettings: false,
        isUpdatingProfile: false,
      })

      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByText('Loading settings...')).toBeInTheDocument()
    })

    it('displays user profile information correctly', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://example.com/avatar.jpg')).toBeInTheDocument()
    })

    it('displays current settings values correctly', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByDisplayValue('USD - US Dollar')).toBeInTheDocument()
      expect(screen.getByDisplayValue('EST - Eastern Standard Time')).toBeInTheDocument()
    })
  })

  describe('Search and Filtering', () => {
    it('filters settings based on search query', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const searchInput = screen.getByPlaceholderText('Search settings...')
      fireEvent.change(searchInput, { target: { value: 'notification' } })
      
      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument()
        expect(screen.getByText('Push Notifications')).toBeInTheDocument()
        expect(screen.queryByText('Full Name')).not.toBeInTheDocument()
      })
    })

    it('shows no results message when search yields no matches', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const searchInput = screen.getByPlaceholderText('Search settings...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      
      await waitFor(() => {
        expect(screen.getByText('No settings found')).toBeInTheDocument()
        expect(screen.getByText('Clear filters')).toBeInTheDocument()
      })
    })

    it('clears search when clear filters button is clicked', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const searchInput = screen.getByPlaceholderText('Search settings...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      
      await waitFor(() => {
        expect(screen.getByText('No settings found')).toBeInTheDocument()
      })
      
      const clearButton = screen.getByText('Clear filters')
      fireEvent.click(clearButton)
      
      await waitFor(() => {
        expect(screen.getByText('Account & Profile')).toBeInTheDocument()
        expect(searchInput).toHaveValue('')
      })
    })
  })

  describe('Settings Updates', () => {
    it('updates profile settings when form values change', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const nameInput = screen.getByDisplayValue('John Doe')
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
      fireEvent.blur(nameInput)
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ fullName: 'Jane Smith' })
      })
    })

    it('updates app settings when dropdown values change', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const currencySelect = screen.getByDisplayValue('USD - US Dollar')
      fireEvent.change(currencySelect, { target: { value: 'EUR' } })
      
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ currency: 'EUR' })
        expect(mockSetCurrency).toHaveBeenCalledWith('EUR')
      })
    })

    it('updates notification settings when toggles are clicked', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const emailToggle = screen.getByRole('switch', { name: /email notifications/i })
      fireEvent.click(emailToggle)
      
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ email_notifications: false })
      })
    })

    it('shows loading state during updates', async () => {
      ;(useSettings as jest.Mock).mockReturnValue({
        profile: mockProfile,
        settings: mockSettings,
        isLoading: false,
        updateSettings: mockUpdateSettings,
        updateProfile: mockUpdateProfile,
        isUpdatingSettings: true,
        isUpdatingProfile: false,
      })

      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Settings')
      
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(sectionHeadings).toHaveLength(4) // Account, Preferences, Notifications, Privacy
    })

    it('has proper form labels and descriptions', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByText('Your display name in the application')).toBeInTheDocument()
    })

    it('has proper form controls with required attributes', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const nameInput = screen.getByLabelText('Full Name')
      expect(nameInput).toHaveAttribute('required')
    })
  })

  describe('Quick Actions', () => {
    it('renders quick actions panel', () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('handles quick action clicks', async () => {
      renderWithProviders(<SettingsPageRedesigned />)
      
      const exportButton = screen.getByText('Export Data')
      fireEvent.click(exportButton)
      
      // Note: This will need to be updated when actual export functionality is implemented
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Export data clicked')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles settings update errors gracefully', async () => {
      const errorMessage = 'Failed to update settings'
      mockUpdateSettings.mockRejectedValueOnce(new Error(errorMessage))
      
      renderWithProviders(<SettingsPageRedesigned />)
      
      const toggle = screen.getByRole('switch', { name: /email notifications/i })
      fireEvent.click(toggle)
      
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalled()
        // Error handling would be tested here once implemented
      })
    })

    it('handles profile update errors gracefully', async () => {
      const errorMessage = 'Failed to update profile'
      mockUpdateProfile.mockRejectedValueOnce(new Error(errorMessage))
      
      renderWithProviders(<SettingsPageRedesigned />)
      
      const nameInput = screen.getByDisplayValue('John Doe')
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
      fireEvent.blur(nameInput)
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled()
        // Error handling would be tested here once implemented
      })
    })
  })

  describe('Responsive Design', () => {
    it('renders mobile-friendly layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      renderWithProviders(<SettingsPageRedesigned />)
      
      // Check for mobile-specific classes or behavior
      const container = screen.getByRole('main') || document.querySelector('[class*="space-y"]')
      expect(container).toBeInTheDocument()
    })
  })
})