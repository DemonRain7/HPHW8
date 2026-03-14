import { getHumorFlavorSteps, getLlmModels, getLlmInputTypes, getLlmOutputTypes, getHumorFlavorStepTypes } from '../../actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StepManager from './step-manager'

export default async function FlavorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const flavorId = Number(id)

  const supabase = await createClient()
  const { data: flavor } = await supabase.from('humor_flavors').select('*').eq('id', flavorId).single()
  if (!flavor) redirect('/chain')

  const [stepsResult, models, inputTypes, outputTypes, stepTypes] = await Promise.all([
    getHumorFlavorSteps(flavorId),
    getLlmModels(),
    getLlmInputTypes(),
    getLlmOutputTypes(),
    getHumorFlavorStepTypes(),
  ])

  return (
    <div>
      <div className="mb-6">
        <a href="/chain" className="text-sm text-purple-600 hover:underline dark:text-purple-400">&larr; Back to Flavors</a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {flavor.slug}
        </h1>
        {flavor.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{flavor.description}</p>
        )}
      </div>

      {stepsResult.error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{stepsResult.error}</p>
      )}

      <StepManager
        flavorId={flavorId}
        initialSteps={stepsResult.data ?? []}
        models={models}
        inputTypes={inputTypes}
        outputTypes={outputTypes}
        stepTypes={stepTypes}
      />
    </div>
  )
}
