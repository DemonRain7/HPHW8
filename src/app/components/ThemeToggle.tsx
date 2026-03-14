'use client'

import { useTheme } from './ThemeProvider'

const options = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-700 dark:bg-gray-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
            theme === opt.value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
