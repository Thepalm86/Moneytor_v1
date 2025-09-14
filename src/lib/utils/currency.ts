/**
 * Comprehensive currency utilities for Moneytor V2
 * Supports major international currencies with special handling for Israeli Shekel
 */

export interface Currency {
  code: string
  symbol: string
  name: string
  position: 'left' | 'right'
  locale: string
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'left', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'left', locale: 'en-GB' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'left', locale: 'en-GB' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'left', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'left', locale: 'en-AU' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'left', locale: 'ja-JP' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', position: 'left', locale: 'de-CH' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', position: 'right', locale: 'en-US' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', position: 'left', locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', position: 'left', locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', position: 'left', locale: 'da-DK' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', position: 'left', locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', position: 'right', locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', position: 'right', locale: 'hu-HU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', position: 'left', locale: 'en-SG' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', position: 'left', locale: 'en-HK' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', position: 'left', locale: 'en-NZ' },
]

/**
 * Get currency by code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(currency => currency.code === code)
}

/**
 * Format currency amount with proper positioning and localization
 * Special handling for Israeli Shekel and other right-positioned currencies
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options: {
    showSymbol?: boolean
    decimals?: number
    locale?: string
  } = {}
): string {
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) {
    // Fallback to basic formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  }

  const {
    showSymbol = true,
    decimals = 2,
    locale = currency.locale,
  } = options

  // Format the number part
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount))

  if (!showSymbol) {
    return amount < 0 ? `-${formattedNumber}` : formattedNumber
  }

  // Handle symbol positioning
  const symbol = currency.symbol
  const isNegative = amount < 0

  if (currency.position === 'right') {
    // Right-positioned currencies (like ILS, CZK, HUF)
    return isNegative ? `-${formattedNumber}${symbol}` : `${formattedNumber}${symbol}`
  } else {
    // Left-positioned currencies (most common)
    return isNegative ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`
  }
}

/**
 * Legacy support - format amount without currency symbol
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format currency for input fields (without styling)
 */
export function formatCurrencyInput(
  amount: number | string,
  currencyCode: string = 'USD'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
  return formatCurrency(numAmount, currencyCode, { showSymbol: false })
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode)
  return currency?.symbol || currencyCode
}

/**
 * Get currency position
 */
export function getCurrencyPosition(currencyCode: string): 'left' | 'right' {
  const currency = getCurrencyByCode(currencyCode)
  return currency?.position || 'left'
}

/**
 * Format currency for display with color coding
 */
export function formatCurrencyWithColor(
  amount: number,
  currencyCode: string = 'USD',
  type: 'income' | 'expense' | 'neutral' = 'neutral'
): { formatted: string; colorClass: string } {
  const formatted = formatCurrency(amount, currencyCode)
  
  let colorClass = 'text-gray-900'
  if (type === 'income' || (type === 'neutral' && amount > 0)) {
    colorClass = 'text-green-600'
  } else if (type === 'expense' || (type === 'neutral' && amount < 0)) {
    colorClass = 'text-red-600'
  }

  return { formatted, colorClass }
}

/**
 * Parse currency string back to number - enhanced version
 */
export function parseCurrency(value: string, currencyCode: string = 'USD'): number {
  if (!value) return 0
  
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) return parseFloat(value) || 0

  // Remove currency symbol and whitespace
  let cleanValue = value
    .replace(currency.symbol, '')
    .replace(/\s/g, '')
    .replace(/,/g, '')

  // Handle negative values
  const isNegative = cleanValue.includes('-')
  cleanValue = cleanValue.replace('-', '')

  const parsed = parseFloat(cleanValue) || 0
  return isNegative ? -parsed : parsed
}

/**
 * Legacy support for existing code
 */
export function parseCurrencyInput(input: string): number {
  return parseCurrency(input, 'USD')
}

/**
 * Get currency options for select components
 */
export function getCurrencyOptions() {
  return CURRENCIES.map(currency => ({
    value: currency.code,
    label: `${currency.symbol} ${currency.name} (${currency.code})`,
    symbol: currency.symbol,
    position: currency.position,
  }))
}

/**
 * Validate currency code
 */
export function isValidCurrencyCode(code: string): boolean {
  return CURRENCIES.some(currency => currency.code === code)
}

/**
 * Get default currency (USD)
 */
export function getDefaultCurrency(): Currency {
  return CURRENCIES[0] // USD
}

/**
 * Format currency for charts and visualizations
 */
export function formatCurrencyForChart(
  amount: number,
  currencyCode: string = 'USD',
  compact: boolean = false
): string {
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) return amount.toString()

  if (compact && Math.abs(amount) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T']
    const unitIndex = Math.floor(Math.log10(Math.abs(amount)) / 3)
    const scaledAmount = amount / Math.pow(1000, unitIndex)
    const formatted = scaledAmount.toFixed(1) + units[unitIndex]
    
    if (currency.position === 'right') {
      return `${formatted}${currency.symbol}`
    } else {
      return `${currency.symbol}${formatted}`
    }
  }

  return formatCurrency(amount, currencyCode, { decimals: 0 })
}

/**
 * Format currency as whole numbers (no decimals) - for clean display
 */
export function formatCurrencyWhole(
  amount: number,
  currencyCode: string = 'USD'
): string {
  return formatCurrency(amount, currencyCode, { decimals: 0 })
}

/**
 * Format number as whole number without currency symbol
 */
export function formatWholeNumber(amount: number): string {
  return Math.round(amount).toLocaleString()
}