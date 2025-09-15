import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in browser environment and variables are missing
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your deployment environment.'
  )
}

// For build time safety, provide fallback values that won't break the build
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// Use actual values if available, otherwise use fallbacks during build
const url = supabaseUrl || fallbackUrl
const key = supabaseAnonKey || fallbackKey

// Warn during build if using fallbacks
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase environment variables not configured. Using fallback values for build. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for production.'
  )
}

// Create the client
export const supabase = createClient<Database>(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Export a function to validate environment at runtime
export function validateSupabaseConfig() {
  if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
}
