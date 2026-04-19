'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createHumorFlavor, updateHumorFlavor, deleteHumorFlavor, duplicateHumorFlavor } from './actions'

type Flavor = {
  id: number
  slug: string
  description: string | null
  created_datetime_utc: string
}

export default function FlavorList({ initialFlavors }: { initialFlavors: Flavor[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [duplicateId, setDuplicateId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      const result = await createHumorFlavor(formData)
      if (result.error) setError(result.error)
      else {
        setShowCreate(false)
        setError(null)
      }
    })
  }

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateHumorFlavor(formData)
      if (result.error) setError(result.error)
      else {
        setEditId(null)
        setError(null)
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this humor flavor?')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', String(id))
      const result = await deleteHumorFlavor(fd)
      if (result.error) setError(result.error)
      else setError(null)
    })
  }

  const handleDuplicate = (formData: FormData) => {
    startTransition(async () => {
      const result = await duplicateHumorFlavor(formData)
      if (result.error) setError(result.error)
      else {
        setDuplicateId(null)
        setError(null)
      }
    })
  }

  const duplicateFlavor = initialFlavors.find((f) => f.id === duplicateId)

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="mb-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
      >
        + New Flavor
      </button>

      {showCreate && (
        <form action={handleCreate} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Create Humor Flavor</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="slug" required placeholder="Slug" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input name="description" placeholder="Description" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={isPending} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {isPending ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {initialFlavors.map((flavor) => (
              <tr key={flavor.id}>
                {editId === flavor.id ? (
                  <EditRow flavor={flavor} onUpdate={handleUpdate} onCancel={() => setEditId(null)} isPending={isPending} />
                ) : (
                  <>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{flavor.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/chain/flavor/${flavor.id}`} className="font-medium text-purple-600 hover:underline dark:text-purple-400">
                        {flavor.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{flavor.description ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(flavor.created_datetime_utc).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditId(flavor.id)} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">Edit</button>
                        <button onClick={() => setDuplicateId(flavor.id)} className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400">Duplicate</button>
                        <button onClick={() => handleDelete(flavor.id)} className="text-xs font-medium text-red-600 hover:underline dark:text-red-400">Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {initialFlavors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No humor flavors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Duplicate Flavor Modal */}
      {duplicateId !== null && duplicateFlavor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Duplicate Flavor</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Duplicating <span className="font-medium text-purple-600 dark:text-purple-400">{duplicateFlavor.slug}</span> and all its related steps.
            </p>
            <form action={handleDuplicate}>
              <input type="hidden" name="id" value={duplicateId} />
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Unique Slug
              </label>
              <input
                name="new_slug"
                required
                defaultValue={`${duplicateFlavor.slug}-copy`}
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. my-flavor-copy"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setDuplicateId(null); setError(null) }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPending ? 'Duplicating...' : 'Duplicate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function EditRow({
  flavor,
  onUpdate,
  onCancel,
  isPending,
}: {
  flavor: Flavor
  onUpdate: (fd: FormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <>
      <td className="px-4 py-3 text-gray-900 dark:text-white">{flavor.id}</td>
      <td className="px-4 py-3" colSpan={2}>
        <form action={onUpdate} className="flex items-center gap-2">
          <input type="hidden" name="id" value={flavor.id} />
          <input name="slug" defaultValue={flavor.slug} required className="w-32 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <input name="description" defaultValue={flavor.description ?? ''} className="w-48 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <button type="submit" disabled={isPending} className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{isPending ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Cancel</button>
        </form>
      </td>
      <td className="px-4 py-3"></td>
      <td className="px-4 py-3"></td>
    </>
  )
}
