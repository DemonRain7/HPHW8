import { getFlavorsWithSteps, getTestImages } from '../actions'
import TestFlavorForm from './test-flavor-form'

export default async function TestPage() {
  const [flavors, images] = await Promise.all([
    getFlavorsWithSteps(),
    getTestImages(),
  ])

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Test Humor Flavor</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Generate captions using the REST API for a specific humor flavor and image.
        Only flavors that already have at least one step configured are listed below.
      </p>
      <TestFlavorForm flavors={flavors} images={images} />
    </div>
  )
}
