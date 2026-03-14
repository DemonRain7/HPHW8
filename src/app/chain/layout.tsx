import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './form-actions'
import ThemeToggle from '../components/ThemeToggle'

export default async function ChainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, is_matrix_admin, first_name, last_name, email')
    .eq('email', user.email)
    .single()

  if (!profile?.is_superadmin && !profile?.is_matrix_admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your account ({user.email}) does not have superadmin or matrix admin privileges.
          </p>
          <form action={signOut}>
            <button type="submit" className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600">
              Sign out
            </button>
          </form>
        </div>
      </main>
    )
  }

  const navItems = [
    { href: '/chain', label: 'Humor Flavors' },
    { href: '/chain/captions', label: 'Captions' },
    { href: '/chain/test', label: 'Test Flavor' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">Prompt Chain</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
