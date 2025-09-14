'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  className?: string
  children?: ReactNode
}

const gradients = {
  blue: 'from-blue-600 via-blue-700 to-indigo-700',
  green: 'from-green-600 via-emerald-700 to-teal-700',
  purple: 'from-purple-600 via-violet-700 to-indigo-700',
  orange: 'from-orange-600 via-amber-700 to-yellow-700',
  red: 'from-red-600 via-rose-700 to-pink-700',
  gray: 'from-gray-600 via-slate-700 to-gray-800',
}

const shadowColors = {
  blue: 'shadow-blue-500/20',
  green: 'shadow-green-500/20',
  purple: 'shadow-purple-500/20',
  orange: 'shadow-orange-500/20',
  red: 'shadow-red-500/20',
  gray: 'shadow-gray-500/20',
}

export function PageHeader({
  title,
  subtitle,
  actions,
  gradient = 'blue',
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 shadow-xl',
        `bg-gradient-to-r ${gradients[gradient]}`,
        shadowColors[gradient],
        className
      )}
    >
      {/* Overlay for better text readability */}
      <div
        className={cn('absolute inset-0 rounded-2xl', `bg-gradient-to-r ${gradients[gradient]}/90`)}
      ></div>

      {/* Content */}
      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-3xl font-bold leading-tight text-white">{title}</h1>
            {subtitle && (
              <p className="text-base leading-relaxed text-white/80 opacity-90">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>
          )}
        </div>

        {/* Additional content */}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {/* Decorative arrow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 transform">
        <div className="h-8 w-8 rotate-45 rounded-lg bg-white/10 backdrop-blur-sm"></div>
      </div>
    </div>
  )
}

interface PageHeaderActionProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'lg' | 'default'
}

export function PageHeaderAction({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
}: PageHeaderActionProps) {
  const variants = {
    primary: 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-lg',
    secondary: 'bg-white/5 hover:bg-white/15 text-white border-white/10 backdrop-blur-sm',
    ghost: 'bg-transparent hover:bg-white/10 text-white border-transparent',
  }

  return (
    <Button
      onClick={onClick}
      className={cn(
        variants[variant],
        'transition-all duration-200 hover:scale-105',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base'
      )}
      size={size}
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
