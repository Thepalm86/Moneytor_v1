import { createClient } from '@/lib/supabase/server'
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper'
import { CurrencyProvider } from '@/contexts/currency-context'
import { getUserProfileWithSettings } from '@/lib/supabase/settings'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  // Get user and their currency preference server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialCurrency = 'USD' // fallback
  if (user?.id) {
    const { data: profile } = await getUserProfileWithSettings(user.id)
    initialCurrency = profile?.preferences?.currency || profile?.currency || 'USD'
  }

  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      <DashboardWrapper initialUser={user}>{children}</DashboardWrapper>
    </CurrencyProvider>
  )
}
