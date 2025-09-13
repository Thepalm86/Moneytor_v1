'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error sending reset email',
          description: error.message,
        })
        return
      }

      setIsEmailSent(true)
      toast({
        title: 'Reset email sent!',
        description: 'Check your inbox for password reset instructions.',
      })
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

  if (isEmailSent) {
    return (
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="pb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent password reset instructions to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="text-gray-600">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>

          <div className="space-y-4">
            <Button onClick={() => setIsEmailSent(false)} variant="outline" className="w-full">
              Try Again
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect border-0 shadow-xl">
      <CardHeader className="pb-8 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Reset Your Password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset email...
              </>
            ) : (
              'Send Reset Email'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
