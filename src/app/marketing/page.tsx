import Link from 'next/link'
import { ArrowRight, Shield, Smartphone, TrendingUp } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Moneytor</span>
          </div>
          <div className="hidden items-center space-x-8 md:flex">
            <a href="#features" className="text-gray-600 transition-colors hover:text-gray-900">
              Features
            </a>
            <a href="#security" className="text-gray-600 transition-colors hover:text-gray-900">
              Security
            </a>
            <a href="#pricing" className="text-gray-600 transition-colors hover:text-gray-900">
              Pricing
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 transition-colors hover:text-gray-900">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-primary rounded-lg px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Take Control of Your
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Finances</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Smart budgeting, expense tracking, and financial insights to help you achieve your
            financial goals with confidence.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="bg-gradient-primary group inline-flex items-center justify-center rounded-lg px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#demo"
              className="rounded-lg border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Everything You Need to Manage Money
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Powerful tools designed to make financial management simple, secure, and effective.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="glass-effect animate-slide-up rounded-2xl p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Smart Analytics</h3>
            <p className="text-gray-600">
              Get detailed insights into your spending patterns with intelligent categorization and
              trend analysis.
            </p>
          </div>

          <div
            className="glass-effect animate-slide-up rounded-2xl p-8"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Bank-Level Security</h3>
            <p className="text-gray-600">
              Your financial data is protected with enterprise-grade encryption and security
              protocols.
            </p>
          </div>

          <div
            className="glass-effect animate-slide-up rounded-2xl p-8"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Smartphone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Mobile First</h3>
            <p className="text-gray-600">
              Access your finances anywhere with our responsive design and progressive web app
              capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="text-sm font-bold text-white">M</span>
                </div>
                <span className="text-xl font-bold">Moneytor</span>
              </div>
              <p className="text-gray-400">
                Take control of your finances with intelligent budgeting and expense tracking.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Moneytor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
