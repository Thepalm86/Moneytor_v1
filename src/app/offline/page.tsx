import React from 'react'
import { Wifi, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-premium">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You're Offline
          </CardTitle>
          <p className="text-gray-600 mt-2">
            No internet connection detected. Some features may not be available.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Offline Features Available */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Available Offline:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>View cached transactions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Add new transactions (will sync when online)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>View cached analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Limited real-time data</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-800">
                Checking connection...
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full h-12 text-base"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Tips */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> Transactions added while offline will automatically sync when your connection is restored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add metadata for better offline experience
export const metadata = {
  title: 'Offline - Moneytor',
  description: 'You are currently offline. Some features are still available.',
}