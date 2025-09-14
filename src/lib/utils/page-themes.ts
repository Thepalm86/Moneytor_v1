export type PageTheme = {
  name: string
  gradient: string
  shadowColor: string
  glowColor: string
  textColor: string
  lightBg: string
  mediumBg: string
  darkBg: string
  accentColor: string
  hoverColor: string
}

export const pageThemes = {
  dashboard: {
    name: 'Dashboard',
    gradient: 'from-blue-600 via-blue-700 to-indigo-700',
    shadowColor: 'shadow-blue-500/25',
    glowColor: 'shadow-blue-500/20',
    textColor: 'text-blue-600',
    lightBg: 'bg-blue-50',
    mediumBg: 'bg-blue-100',
    darkBg: 'bg-blue-600',
    accentColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  transactions: {
    name: 'Transactions',
    gradient: 'from-orange-600 via-amber-700 to-yellow-700',
    shadowColor: 'shadow-orange-500/25',
    glowColor: 'shadow-orange-500/20',
    textColor: 'text-orange-600',
    lightBg: 'bg-orange-50',
    mediumBg: 'bg-orange-100',
    darkBg: 'bg-orange-600',
    accentColor: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  categories: {
    name: 'Categories',
    gradient: 'from-purple-600 via-violet-700 to-indigo-700',
    shadowColor: 'shadow-purple-500/25',
    glowColor: 'shadow-purple-500/20',
    textColor: 'text-purple-600',
    lightBg: 'bg-purple-50',
    mediumBg: 'bg-purple-100',
    darkBg: 'bg-purple-600',
    accentColor: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
  },
  analytics: {
    name: 'Analytics',
    gradient: 'from-green-600 via-emerald-700 to-teal-700',
    shadowColor: 'shadow-green-500/25',
    glowColor: 'shadow-green-500/20',
    textColor: 'text-green-600',
    lightBg: 'bg-green-50',
    mediumBg: 'bg-green-100',
    darkBg: 'bg-green-600',
    accentColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
  budgets: {
    name: 'Budgets',
    gradient: 'from-red-600 via-rose-700 to-pink-700',
    shadowColor: 'shadow-red-500/25',
    glowColor: 'shadow-red-500/20',
    textColor: 'text-red-600',
    lightBg: 'bg-red-50',
    mediumBg: 'bg-red-100',
    darkBg: 'bg-red-600',
    accentColor: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
  },
  goals: {
    name: 'Goals',
    gradient: 'from-teal-600 via-cyan-700 to-blue-700',
    shadowColor: 'shadow-teal-500/25',
    glowColor: 'shadow-teal-500/20',
    textColor: 'text-teal-600',
    lightBg: 'bg-teal-50',
    mediumBg: 'bg-teal-100',
    darkBg: 'bg-teal-600',
    accentColor: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
  },
  settings: {
    name: 'Settings',
    gradient: 'from-gray-600 via-slate-700 to-gray-800',
    shadowColor: 'shadow-gray-500/25',
    glowColor: 'shadow-gray-500/20',
    textColor: 'text-gray-600',
    lightBg: 'bg-gray-50',
    mediumBg: 'bg-gray-100',
    darkBg: 'bg-gray-600',
    accentColor: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
  },
} as const

export type PageThemeKey = keyof typeof pageThemes

export function getPageTheme(path: string): PageTheme {
  // Extract page name from path
  const pathSegment = path.split('/').pop() || path.split('/')[1] || 'dashboard'

  // Map path to theme key
  if (pathSegment === 'dashboard' || path === '/') return pageThemes.dashboard
  if (pathSegment === 'transactions') return pageThemes.transactions
  if (pathSegment === 'categories') return pageThemes.categories
  if (pathSegment === 'analytics') return pageThemes.analytics
  if (pathSegment === 'budgets') return pageThemes.budgets
  if (pathSegment === 'goals') return pageThemes.goals
  if (pathSegment === 'settings') return pageThemes.settings

  // Default to dashboard theme
  return pageThemes.dashboard
}

export function getPageThemeByKey(key: PageThemeKey): PageTheme {
  return pageThemes[key]
}

// Helper function to get theme colors for dynamic styling
export function getThemeClasses(theme: PageTheme) {
  return {
    gradient: `bg-gradient-to-r ${theme.gradient}`,
    shadow: theme.shadowColor,
    glow: theme.glowColor,
    text: theme.textColor,
    lightBg: theme.lightBg,
    mediumBg: theme.mediumBg,
    darkBg: theme.darkBg,
    accent: theme.accentColor,
    hover: theme.hoverColor,
  }
}

// Navigation color mapping for active states
export const navigationThemeColors = {
  '/dashboard': pageThemes.dashboard,
  '/transactions': pageThemes.transactions,
  '/categories': pageThemes.categories,
  '/analytics': pageThemes.analytics,
  '/budgets': pageThemes.budgets,
  '/goals': pageThemes.goals,
  '/settings': pageThemes.settings,
} as const
