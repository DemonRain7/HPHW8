import { getHumorFlavors } from './actions'
import FlavorList from './flavor-list'

export default async function ChainPage() {
  const { data: flavors, error } = await getHumorFlavors()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Humor Flavors</h1>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}
      <FlavorList initialFlavors={flavors ?? []} />
    </div>
  )
}
