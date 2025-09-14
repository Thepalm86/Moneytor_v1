import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/use-user'
import { getFinancialKPIs, type DateRange } from '@/lib/supabase/analytics'

export function useFinancialKPIs(dateRange: DateRange) {
  const { user } = useUser()

  return useQuery({
    queryKey: ['financial-kpis', user?.id, dateRange.from, dateRange.to],
    queryFn: () => getFinancialKPIs(user!.id, dateRange),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}