import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  DashboardSkeleton, 
  ChartSkeleton, 
  MobileChartSkeleton,
  MobileTransactionListSkeleton,
  ProgressiveSkeleton 
} from '@/components/ui/enhanced-skeleton'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
    </div>
  )
}

// Enhanced page loading with progressive skeleton
export function PageLoadingSpinner({ 
  type = 'dashboard',
  useProgressive = false 
}: { 
  type?: 'dashboard' | 'chart' | 'list' | 'generic'
  useProgressive?: boolean 
}) {
  if (type === 'generic' || !useProgressive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const getSkeletonComponent = () => {
    switch (type) {
      case 'dashboard':
        return useProgressive ? <ProgressiveDashboardLoader /> : <DashboardSkeleton />
      case 'chart':
        return (
          <>
            <div className="block lg:hidden">
              <MobileChartSkeleton />
            </div>
            <div className="hidden lg:block">
              <ChartSkeleton />
            </div>
          </>
        )
      case 'list':
        return <MobileTransactionListSkeleton />
      default:
        return <DashboardSkeleton />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-4 pt-20 pb-24 lg:p-8 lg:pt-8 lg:pb-8">
        {getSkeletonComponent()}
      </div>
    </div>
  )
}

// Progressive dashboard loader that stages content loading
function ProgressiveDashboardLoader() {
  return <ProgressiveSkeleton />
}