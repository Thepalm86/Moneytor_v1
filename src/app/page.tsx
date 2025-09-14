import { redirect } from 'next/navigation'

export default function HomePage() {
  // This page should not be reached due to middleware redirects,
  // but provide a fallback redirect as a safety measure
  redirect('/login')
}
