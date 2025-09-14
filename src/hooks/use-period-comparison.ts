import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/use-user'
import { getPeriodComparison, type DateRange } from '@/lib/supabase/analytics'

export function usePeriodComparison(
  currentPeriod: DateRange,
  comparisonType: 'previous' | 'year-over-year' = 'previous'
) {
  const { user } = useUser()

  return useQuery({
    queryKey: ['period-comparison', user?.id, currentPeriod.from, currentPeriod.to, comparisonType],
    queryFn: () => getPeriodComparison(user!.id, currentPeriod, comparisonType),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}