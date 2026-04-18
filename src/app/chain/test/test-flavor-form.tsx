'use client'

import { useState, useTransition } from 'react'
import { testHumorFlavor } from '../actions'

type Flavor = { id: number; slug: string; description: string | null }
type ImageItem = { id: string; url: string; image_description: string | null }

export default function TestFlavorForm({
  flavors,
  images,
}: {
  flavors: Flavor[]
  images: ImageItem[]
}) {
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [result, setResult] = useState<Record<string, unknown>[] | Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleTest = () => {
    if (!selectedFlavor || !selectedImage) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('humor_flavor_id', selectedFlavor)
      fd.set('image_id', selectedImage)
      const res = await testHumorFlavor(fd)
      if (res.error) {
        setError(res.error)
        setResult(null)
      } else {
        setResult(res.captions)
        setError(null)
      }
    })
  }

  const selectedImg = images.find((i) => i.id === selectedImage)

  if (flavors.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">No testable flavors</p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          None of your humor flavors have any steps configured yet. Open a flavor from the{' '}
          <a href="/chain" className="font-semibold underline">flavor list</a> and add at least one step before testing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Humor Flavor</label>
          <select
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Select flavor --</option>
            {flavors.map((f) => (
              <option key={f.id} value={f.id}>{f.slug} (ID: {f.id})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Test Image</label>
          <select
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Select image --</option>
            {images.map((img) => (
              <option key={img.id} value={img.id}>
                {img.image_description || img.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedImg && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImg.url}
            alt={selectedImg.image_description ?? 'Test image'}
            className="max-h-64 rounded-lg object-contain"
          />
          {selectedImg.image_description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selectedImg.image_description}</p>
          )}
        </div>
      )}

      <button
        onClick={handleTest}
        disabled={isPending || !selectedFlavor || !selectedImage}
        className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Generating Captions...' : 'Generate Captions'}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Generated Captions</h3>
          {Array.isArray(result) ? (
            <ul className="space-y-3">
              {result.map((item: Record<string, unknown>, i: number) => {
                const text = typeof item === 'string'
                  ? item
                  : (item?.content ?? item?.caption_text ?? item?.text ?? item?.caption ?? JSON.stringify(item))
                return (
                  <li key={i} className="break-words rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {String(text)}
                  </li>
                )
              })}
            </ul>
          ) : (
            <pre className="overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
