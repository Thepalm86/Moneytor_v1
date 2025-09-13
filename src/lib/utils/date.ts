import { format, isToday, isYesterday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, subDays } from 'date-fns'

export function formatTransactionDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) return 'Today'
  if (isYesterday(dateObj)) return 'Yesterday'
  return format(dateObj, 'MMM dd, yyyy')
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM dd')
}

export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'EEEE, MMMM dd, yyyy')
}

export function formatDateInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

// Date range helpers for common periods
export function getDateRange(period: 'today' | 'week' | 'month' | 'year' | 'last7days' | 'last30days' | 'lastMonth'): {
  from: Date
  to: Date
} {
  const now = new Date()
  
  switch (period) {
    case 'today':
      return { from: now, to: now }
    
    case 'week':
      return { 
        from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        to: endOfWeek(now, { weekStartsOn: 1 })
      }
    
    case 'month':
      return { 
        from: startOfMonth(now), 
        to: endOfMonth(now) 
      }
    
    case 'year':
      return { 
        from: startOfYear(now), 
        to: endOfYear(now) 
      }
    
    case 'last7days':
      return { 
        from: subDays(now, 7), 
        to: now 
      }
    
    case 'last30days':
      return { 
        from: subDays(now, 30), 
        to: now 
      }
    
    case 'lastMonth':
      const lastMonth = subMonths(now, 1)
      return { 
        from: startOfMonth(lastMonth), 
        to: endOfMonth(lastMonth) 
      }
    
    default:
      return { from: now, to: now }
  }
}

export function getDateRangeLabel(period: 'today' | 'week' | 'month' | 'year' | 'last7days' | 'last30days' | 'lastMonth'): string {
  switch (period) {
    case 'today':
      return 'Today'
    case 'week':
      return 'This Week'
    case 'month':
      return 'This Month'
    case 'year':
      return 'This Year'
    case 'last7days':
      return 'Last 7 Days'
    case 'last30days':
      return 'Last 30 Days'
    case 'lastMonth':
      return 'Last Month'
    default:
      return period
  }
}