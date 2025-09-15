'use client'

import React from 'react'
import { Wifi, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-4">
      <Card className="glass-card border-premium w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">You're Offline</CardTitle>
          <p className="mt-2 text-gray-600">
            No internet connection detected. Some features may not be available.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Offline Features Available */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Available Offline:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>View cached transactions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Add new transactions (will sync when online)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>View cached analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>Limited real-time data</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium text-amber-800">Checking connection...</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="h-12 w-full text-base"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Link href="/dashboard">
              <Button variant="outline" className="h-12 w-full text-base" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Tips */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> Transactions added while offline will automatically sync when
              your connection is restored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
