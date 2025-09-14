'use client'

/**
 * Settings Layout Component
 * Provides the overall layout structure for settings pages
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
}

export function SettingsLayout({ children, sidebar, className }: SettingsLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col lg:flex-row', className)}>
      {/* Sidebar */}
      {sidebar && (
        <div className="w-full lg:w-80 xl:w-96 border-r border-gray-200/50 bg-white/40 backdrop-blur-sm">
          <div className="sticky top-0 p-6">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="p-6 lg:p-8 xl:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}

interface SettingsSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  sections: Array<{
    id: string
    title: string
    description: string
    icon: string
    gradient: string
  }>
}

export function SettingsSidebar({ 
  activeSection, 
  onSectionChange, 
  sections 
}: SettingsSidebarProps) {
  return (
    <nav className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
      
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={cn(
            'w-full text-left p-4 rounded-xl transition-all duration-200',
            'hover:shadow-lg hover:scale-[1.02]',
            activeSection === section.id
              ? `bg-gradient-to-r ${section.gradient} text-white shadow-lg`
              : 'bg-white/60 hover:bg-white/80 text-gray-700 shadow-sm backdrop-blur-sm'
          )}
        >
          <div className="flex items-start space-x-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-lg',
              activeSection === section.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            )}>
              {section.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{section.title}</h3>
              <p className={cn(
                'text-sm mt-1 line-clamp-2',
                activeSection === section.id
                  ? 'text-white/80'
                  : 'text-gray-500'
              )}>
                {section.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </nav>
  )
}