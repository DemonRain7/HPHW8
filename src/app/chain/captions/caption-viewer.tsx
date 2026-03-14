'use client'

import { useState, useTransition } from 'react'
import { getCaptionsByFlavor } from '../actions'

type Flavor = { id: number; slug: string; description: string | null }
type Caption = {
  id: number
  created_datetime_utc: string
  content: string | null
  is_public: boolean | null
  like_count: number | null
  image_id: string | null
}

export default function CaptionViewer({ flavors }: { flavors: Flavor[] }) {
  const [selectedFlavorId, setSelectedFlavorId] = useState<number | null>(null)
  const [captions, setCaptions] = useState<Caption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSelect = (flavorId: number) => {
    setSelectedFlavorId(flavorId)
    startTransition(async () => {
      const result = await getCaptionsByFlavor(flavorId)
      if (result.error) {
        setError(result.error)
        setCaptions([])
      } else {
        setCaptions(result.data ?? [])
        setError(null)
      }
    })
  }

  return (
    <div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Humor Flavor</label>
        <select
          value={selectedFlavorId ?? ''}
          onChange={(e) => e.target.value && handleSelect(Number(e.target.value))}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">-- Choose a flavor --</option>
          {flavors.map((f) => (
            <option key={f.id} value={f.id}>{f.slug} (ID: {f.id})</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}

      {isPending && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading captions...</p>
      )}

      {!isPending && selectedFlavorId && captions.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No captions found for this flavor.</p>
      )}

      {captions.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Caption</th>
                <th className="px-4 py-3">Likes</th>
                <th className="px-4 py-3">Public</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {captions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{c.id}</td>
                  <td className="max-w-md px-4 py-3 text-gray-700 dark:text-gray-300">{c.content ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.like_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c.is_public ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {c.is_public ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(c.created_datetime_utc).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
