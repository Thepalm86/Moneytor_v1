import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/use-user'
import { getCategoryInsights, type DateRange } from '@/lib/supabase/analytics'

export function useCategoryInsights(
  dateRange: DateRange,
  type: 'income' | 'expense' | 'all' = 'all'
) {
  const { user } = useUser()

  return useQuery({
    queryKey: ['category-insights', user?.id, dateRange.from, dateRange.to, type],
    queryFn: () => getCategoryInsights(user!.id, dateRange, type),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}