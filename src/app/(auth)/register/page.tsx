'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = form.watch('password')
  
  // Password strength indicators
  const passwordCriteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
  ]

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: error.message,
        })
        return
      }

      toast({
        title: 'Account created successfully!',
        description: 'Welcome to Moneytor. Let\'s start managing your finances.',
      })

      // Small delay to ensure session is set, then redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/dashboard')
    } catch (_error) {
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
    <Card className="border-0 shadow-xl glass-effect">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create Your Account
        </CardTitle>
        <CardDescription className="text-gray-600">
          Join thousands of users taking control of their finances
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Password strength indicators */}
            {password && (
              <div className="mt-3 space-y-2">
                {passwordCriteria.map((criterion, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      criterion.met ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {criterion.met && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-xs ${
                      criterion.met ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {criterion.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                {...form.register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input type="checkbox" className="mt-1 rounded border-gray-300" required />
            <p className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-800 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}