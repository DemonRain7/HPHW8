import { getHumorFlavors } from '../actions'
import CaptionViewer from './caption-viewer'

export default async function CaptionsPage() {
  const { data: flavors } = await getHumorFlavors()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Captions by Flavor</h1>
      <CaptionViewer flavors={flavors ?? []} />
    </div>
  )
}
