import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For build time safety, provide fallback values that won't break the build
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-key'

// Use actual values if available, otherwise use fallbacks during build
const url = supabaseUrl || fallbackUrl
const key = supabaseAnonKey || fallbackKey

// Check for missing environment variables at runtime (not build time)
function checkEnvironmentVariables() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      // Only throw error in browser environment
      throw new Error('Missing Supabase environment variables')
    }
    // In Node.js/build environment, just warn
    console.warn('Supabase environment variables not configured')
  }
}

// Create the client with fallback values
export const supabase = createClient<Database>(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Export a function to validate environment at runtime
export function validateSupabaseConfig() {
  checkEnvironmentVariables()
}
