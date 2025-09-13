export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrencyInput(input: string): number {
  // Remove currency symbols and non-numeric characters except dots and commas
  const cleaned = input.replace(/[^\d.,]/g, '')
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '.')
  
  // Parse as float
  const parsed = parseFloat(normalized)
  
  return isNaN(parsed) ? 0 : parsed
}