import { createClient } from '@/lib/supabase/server'
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper'

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
    <DashboardWrapper initialUser={user}>
      {children}
    </DashboardWrapper>
  )
}