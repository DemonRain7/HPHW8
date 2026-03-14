'use client'

import { useState, useTransition } from 'react'
import {
  createHumorFlavorStep,
  updateHumorFlavorStep,
  deleteHumorFlavorStep,
  reorderHumorFlavorStep,
} from '../../actions'

type Step = {
  id: number
  humor_flavor_id: number
  order_by: number
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  description: string | null
  llm_temperature: number | null
  llm_model_id: number | null
  llm_input_type_id: number | null
  llm_output_type_id: number | null
  humor_flavor_step_type_id: number | null
}

type RefOption = { id: number; name?: string; slug?: string }

export default function StepManager({
  flavorId,
  initialSteps,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
}: {
  flavorId: number
  initialSteps: Step[]
  models: RefOption[]
  inputTypes: RefOption[]
  outputTypes: RefOption[]
  stepTypes: RefOption[]
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (formData: FormData) => {
    formData.set('humor_flavor_id', String(flavorId))
    startTransition(async () => {
      const result = await createHumorFlavorStep(formData)
      if (result.error) setError(result.error)
      else {
        setShowCreate(false)
        setError(null)
      }
    })
  }

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateHumorFlavorStep(formData)
      if (result.error) setError(result.error)
      else {
        setEditId(null)
        setError(null)
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this step?')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', String(id))
      const result = await deleteHumorFlavorStep(fd)
      if (result.error) setError(result.error)
      else setError(null)
    })
  }

  const handleReorder = (stepId: number, direction: 'up' | 'down') => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('step_id', String(stepId))
      fd.set('humor_flavor_id', String(flavorId))
      fd.set('direction', direction)
      const result = await reorderHumorFlavorStep(fd)
      if (result.error) setError(result.error)
      else setError(null)
    })
  }

  const inputClasses = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
  const selectClasses = inputClasses

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Steps ({initialSteps.length})</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          + Add Step
        </button>
      </div>

      {showCreate && (
        <form action={handleCreate} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">New Step</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
              <input name="description" placeholder="Step description" className={inputClasses} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Temperature</label>
              <input name="llm_temperature" type="number" step="0.1" min="0" max="2" placeholder="0.7" className={inputClasses} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Model</label>
              <select name="llm_model_id" className={selectClasses}>
                <option value="">-- Select --</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name ?? m.id}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Input Type</label>
              <select name="llm_input_type_id" className={selectClasses}>
                <option value="">-- Select --</option>
                {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug ?? t.id}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Output Type</label>
              <select name="llm_output_type_id" className={selectClasses}>
                <option value="">-- Select --</option>
                {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug ?? t.id}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Step Type</label>
              <select name="humor_flavor_step_type_id" className={selectClasses}>
                <option value="">-- Select --</option>
                {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.slug ?? t.id}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">System Prompt</label>
            <textarea name="llm_system_prompt" rows={3} placeholder="System prompt..." className={inputClasses} />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">User Prompt</label>
            <textarea name="llm_user_prompt" rows={3} placeholder="User prompt..." className={inputClasses} />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={isPending} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {isPending ? 'Creating...' : 'Create Step'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {initialSteps.map((step, index) => (
          <div key={step.id} className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {editId === step.id ? (
              <EditStepForm
                step={step}
                models={models}
                inputTypes={inputTypes}
                outputTypes={outputTypes}
                stepTypes={stepTypes}
                onUpdate={handleUpdate}
                onCancel={() => setEditId(null)}
                isPending={isPending}
              />
            ) : (
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {step.order_by}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {step.description || `Step ${step.order_by}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorder(step.id, 'up')}
                      disabled={index === 0 || isPending}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      title="Move up"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      onClick={() => handleReorder(step.id, 'down')}
                      disabled={index === initialSteps.length - 1 || isPending}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      title="Move down"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onClick={() => setEditId(step.id)} className="ml-2 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">Edit</button>
                    <button onClick={() => handleDelete(step.id)} className="ml-2 text-xs font-medium text-red-600 hover:underline dark:text-red-400">Delete</button>
                  </div>
                </div>
                <div className="grid gap-2 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2 lg:grid-cols-4">
                  <div><span className="font-medium">Model:</span> {models.find((m) => m.id === step.llm_model_id)?.name ?? step.llm_model_id ?? '-'}</div>
                  <div><span className="font-medium">Temp:</span> {step.llm_temperature ?? '-'}</div>
                  <div><span className="font-medium">Input:</span> {inputTypes.find((t) => t.id === step.llm_input_type_id)?.slug ?? '-'}</div>
                  <div><span className="font-medium">Output:</span> {outputTypes.find((t) => t.id === step.llm_output_type_id)?.slug ?? '-'}</div>
                </div>
                {step.llm_system_prompt && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">System Prompt:</p>
                    <p className="mt-0.5 rounded bg-gray-50 p-2 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">{step.llm_system_prompt}</p>
                  </div>
                )}
                {step.llm_user_prompt && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">User Prompt:</p>
                    <p className="mt-0.5 rounded bg-gray-50 p-2 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">{step.llm_user_prompt}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {initialSteps.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
            No steps yet. Click &quot;+ Add Step&quot; to create the first step.
          </div>
        )}
      </div>
    </div>
  )
}

function EditStepForm({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  onUpdate,
  onCancel,
  isPending,
}: {
  step: Step
  models: RefOption[]
  inputTypes: RefOption[]
  outputTypes: RefOption[]
  stepTypes: RefOption[]
  onUpdate: (fd: FormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const inputClasses = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'

  return (
    <form action={onUpdate} className="p-4">
      <input type="hidden" name="id" value={step.id} />
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Edit Step {step.order_by}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
          <input name="description" defaultValue={step.description ?? ''} className={inputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Temperature</label>
          <input name="llm_temperature" type="number" step="0.1" min="0" max="2" defaultValue={step.llm_temperature ?? ''} className={inputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Model</label>
          <select name="llm_model_id" defaultValue={step.llm_model_id ?? ''} className={inputClasses}>
            <option value="">-- Select --</option>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name ?? m.id}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Input Type</label>
          <select name="llm_input_type_id" defaultValue={step.llm_input_type_id ?? ''} className={inputClasses}>
            <option value="">-- Select --</option>
            {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug ?? t.id}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Output Type</label>
          <select name="llm_output_type_id" defaultValue={step.llm_output_type_id ?? ''} className={inputClasses}>
            <option value="">-- Select --</option>
            {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug ?? t.id}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Step Type</label>
          <select name="humor_flavor_step_type_id" defaultValue={step.humor_flavor_step_type_id ?? ''} className={inputClasses}>
            <option value="">-- Select --</option>
            {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.slug ?? t.id}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">System Prompt</label>
        <textarea name="llm_system_prompt" rows={3} defaultValue={step.llm_system_prompt ?? ''} className={inputClasses} />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">User Prompt</label>
        <textarea name="llm_user_prompt" rows={3} defaultValue={step.llm_user_prompt ?? ''} className={inputClasses} />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {isPending ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
          Cancel
        </button>
      </div>
    </form>
  )
}
