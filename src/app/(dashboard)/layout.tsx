import { createClient } from '@/lib/supabase/server'
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper'
import { CurrencyProvider } from '@/contexts/currency-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  // Try to get user server-side for initial render optimization
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <CurrencyProvider>
      <DashboardWrapper initialUser={user}>
        {children}
      </DashboardWrapper>
    </CurrencyProvider>
  )
}