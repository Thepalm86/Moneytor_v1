import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline - Moneytor',
  description: 'You are currently offline. Some features are still available.',
}

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children
}
