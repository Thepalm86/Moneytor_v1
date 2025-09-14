'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPageTheme, type PageTheme } from '@/lib/utils/page-themes'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  theme?: PageTheme
  className?: string
  children?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  actions,
  theme,
  className,
  children,
}: PageHeaderProps) {
  const pathname = usePathname()
  const currentTheme = theme || getPageTheme(pathname)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-8 shadow-2xl transition-all duration-300',
        `bg-gradient-to-r ${currentTheme.gradient}`,
        currentTheme.shadowColor,
        'hover:shadow-3xl hover:scale-[1.01]',
        className
      )}
    >
      {/* Enhanced background overlay with subtle pattern */}
      <div className="absolute inset-0 bg-black/5"></div>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      ></div>

      {/* Glow effects */}
      <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-sm">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>
          )}
        </div>

        {/* Additional content */}
        {children && (
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            {children}
          </div>
        )}
      </div>

      {/* Premium decorative elements */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rotate-45 rounded-sm bg-white/20 backdrop-blur-sm"></div>
          <div className="h-4 w-4 rotate-45 rounded-lg bg-white/30 shadow-lg backdrop-blur-sm"></div>
          <div className="h-3 w-3 rotate-45 rounded-sm bg-white/20 backdrop-blur-sm"></div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute right-6 top-6">
        <div className="h-8 w-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"></div>
      </div>
      <div className="absolute bottom-6 left-6">
        <div className="h-6 w-6 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"></div>
      </div>
    </div>
  )
}

interface PageHeaderActionProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'lg' | 'default'
  disabled?: boolean
}

export function PageHeaderAction({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
  disabled = false,
}: PageHeaderActionProps) {
  const variants = {
    primary:
      'bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-md shadow-xl hover:shadow-2xl border',
    secondary: 'bg-white/8 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm border',
    ghost: 'bg-transparent hover:bg-white/15 text-white border-transparent backdrop-blur-sm',
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variants[variant],
        'rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95',
        'focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
        disabled && 'cursor-not-allowed opacity-50 hover:scale-100',
        size === 'sm' && 'h-9 px-4 py-2 text-sm',
        size === 'lg' && 'h-14 px-8 py-4 text-lg',
        size === 'default' && 'h-11 px-6 py-3'
      )}
    >
      {children}
    </Button>
  )
}

interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="mx-1 h-4 w-4 text-white/60"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={cn('text-sm font-medium', item.current ? 'text-white' : 'text-white/60')}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
