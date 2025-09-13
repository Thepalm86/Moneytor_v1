import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import { QueryProvider } from '@/lib/providers/query-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Moneytor - Personal Finance Management',
    template: '%s | Moneytor',
  },
  description: 'Take control of your finances with intelligent budgeting, expense tracking, and financial insights.',
  keywords: ['finance', 'budgeting', 'expenses', 'money management', 'financial planning'],
  authors: [{ name: 'Moneytor Team' }],
  creator: 'Moneytor',
  metadataBase: new URL('https://moneytor.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moneytor.app',
    title: 'Moneytor - Personal Finance Management',
    description: 'Take control of your finances with intelligent budgeting, expense tracking, and financial insights.',
    siteName: 'Moneytor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moneytor - Personal Finance Management',
    description: 'Take control of your finances with intelligent budgeting, expense tracking, and financial insights.',
    creator: '@moneytor',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-id',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}