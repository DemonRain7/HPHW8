import SignInButton from './sign-in-button'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Prompt Chain Tool</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in with your Google account. Only superadmins and matrix admins can access.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <SignInButton />
        </div>
      </div>
    </main>
  )
}
