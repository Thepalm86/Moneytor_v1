'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign out failed',
          description: error.message,
        })
        return
      }

      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of your account.',
      })

      router.push('/login')
      router.refresh()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="text-gray-600 hover:border-red-300 hover:text-red-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  )
}
