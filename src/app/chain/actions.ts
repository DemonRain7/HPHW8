'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, is_matrix_admin')
    .eq('email', user.email)
    .single()

  if (!profile?.is_superadmin && !profile?.is_matrix_admin) redirect('/login')
  return { supabase, user }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Humor Flavors CRUD ──

export async function getHumorFlavors() {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('humor_flavors')
    .select('*')
    .order('id', { ascending: true })
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createHumorFlavor(formData: FormData) {
  const { supabase } = await requireAdmin()
  const slug = String(formData.get('slug') ?? '')
  const description = String(formData.get('description') ?? '')

  const { error } = await supabase.from('humor_flavors').insert({
    slug,
    description: description || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/chain')
  return { error: null }
}

export async function updateHumorFlavor(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get('id'))
  const slug = String(formData.get('slug') ?? '')
  const description = String(formData.get('description') ?? '')

  const updates: Record<string, string | null> = {}
  if (slug) updates.slug = slug
  updates.description = description || null

  const { error } = await supabase.from('humor_flavors').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/chain')
  return { error: null }
}

export async function deleteHumorFlavor(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get('id'))
  const { error } = await supabase.from('humor_flavors').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/chain')
  return { error: null }
}

// ── Duplicate Humor Flavor (with all steps) ──

export async function duplicateHumorFlavor(formData: FormData) {
  const { supabase } = await requireAdmin()
  const sourceId = Number(formData.get('id'))
  const newSlug = String(formData.get('new_slug') ?? '')

  if (!newSlug.trim()) return { error: 'A new unique slug is required.' }

  // Fetch the source flavor
  const { data: source, error: fetchErr } = await supabase
    .from('humor_flavors')
    .select('*')
    .eq('id', sourceId)
    .single()
  if (fetchErr || !source) return { error: fetchErr?.message ?? 'Source flavor not found.' }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('humor_flavors')
    .select('id')
    .eq('slug', newSlug.trim())
    .limit(1)
  if (existing && existing.length > 0) return { error: `Slug "${newSlug}" already exists.` }

  // Create the new flavor
  const { data: newFlavor, error: insertErr } = await supabase
    .from('humor_flavors')
    .insert({ slug: newSlug.trim(), description: source.description })
    .select('id')
    .single()
  if (insertErr || !newFlavor) return { error: insertErr?.message ?? 'Failed to create new flavor.' }

  // Copy all steps from the source flavor
  const { data: steps, error: stepsErr } = await supabase
    .from('humor_flavor_steps')
    .select('*')
    .eq('humor_flavor_id', sourceId)
    .order('order_by', { ascending: true })

  if (stepsErr) return { error: stepsErr.message }

  if (steps && steps.length > 0) {
    const newSteps = steps.map(({ id, created_datetime_utc, ...rest }) => ({
      ...rest,
      humor_flavor_id: newFlavor.id,
    }))
    const { error: copyErr } = await supabase.from('humor_flavor_steps').insert(newSteps)
    if (copyErr) return { error: copyErr.message }
  }

  revalidatePath('/chain')
  return { error: null }
}

// ── Humor Flavor Steps CRUD ──

export async function getHumorFlavorSteps(humorFlavorId: number) {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('humor_flavor_steps')
    .select('*')
    .eq('humor_flavor_id', humorFlavorId)
    .order('order_by', { ascending: true })
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createHumorFlavorStep(formData: FormData) {
  const { supabase } = await requireAdmin()
  const humorFlavorId = Number(formData.get('humor_flavor_id'))

  // Get the next order_by value
  const { data: existing } = await supabase
    .from('humor_flavor_steps')
    .select('order_by')
    .eq('humor_flavor_id', humorFlavorId)
    .order('order_by', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.order_by ?? 0) + 1

  const insert: Record<string, string | number | null> = {
    humor_flavor_id: humorFlavorId,
    order_by: nextOrder,
    llm_system_prompt: String(formData.get('llm_system_prompt') ?? '') || null,
    llm_user_prompt: String(formData.get('llm_user_prompt') ?? '') || null,
    description: String(formData.get('description') ?? '') || null,
  }

  const temperature = formData.get('llm_temperature')
  if (temperature) insert.llm_temperature = Number(temperature)

  const modelId = formData.get('llm_model_id')
  if (modelId) insert.llm_model_id = Number(modelId)

  const inputTypeId = formData.get('llm_input_type_id')
  if (inputTypeId) insert.llm_input_type_id = Number(inputTypeId)

  const outputTypeId = formData.get('llm_output_type_id')
  if (outputTypeId) insert.llm_output_type_id = Number(outputTypeId)

  const stepTypeId = formData.get('humor_flavor_step_type_id')
  if (stepTypeId) insert.humor_flavor_step_type_id = Number(stepTypeId)

  const { error } = await supabase.from('humor_flavor_steps').insert(insert)
  if (error) return { error: error.message }
  revalidatePath('/chain')
  return { error: null }
}

export async function updateHumorFlavorStep(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get('id'))

  const updates: Record<string, string | number | null> = {}

  const fields = ['llm_system_prompt', 'llm_user_prompt', 'description']
  for (const f of fields) {
    if (formData.has(f)) updates[f] = String(formData.get(f) ?? '') || null
  }

  const numFields = ['llm_temperature', 'llm_model_id', 'llm_input_type_id', 'llm_output_type_id', 'humor_flavor_step_type_id', 'order_by']
  for (const f of numFields) {
    if (formData.has(f) && formData.get(f) !== '') updates[f] = Number(formData.get(f))
  }

  const { error } = await supabase.from('humor_flavor_steps').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/chain')
  return { error: null }
}

export async function deleteHumorFlavorStep(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get('id'))
  const { error } = await supabase.from('humor_flavor_steps').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/chain')
  return { error: null }
}

export async function reorderHumorFlavorStep(formData: FormData) {
  const { supabase } = await requireAdmin()
  const stepId = Number(formData.get('step_id'))
  const humorFlavorId = Number(formData.get('humor_flavor_id'))
  const direction = String(formData.get('direction')) // 'up' or 'down'

  // Get all steps for this flavor
  const { data: steps } = await supabase
    .from('humor_flavor_steps')
    .select('id, order_by')
    .eq('humor_flavor_id', humorFlavorId)
    .order('order_by', { ascending: true })

  if (!steps || steps.length < 2) return { error: null }

  const currentIndex = steps.findIndex((s) => s.id === stepId)
  if (currentIndex === -1) return { error: 'Step not found' }

  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (swapIndex < 0 || swapIndex >= steps.length) return { error: null }

  const currentOrder = steps[currentIndex].order_by
  const swapOrder = steps[swapIndex].order_by

  // Swap order_by values
  await supabase.from('humor_flavor_steps').update({ order_by: swapOrder }).eq('id', steps[currentIndex].id)
  await supabase.from('humor_flavor_steps').update({ order_by: currentOrder }).eq('id', steps[swapIndex].id)

  revalidatePath('/chain')
  return { error: null }
}

// ── Captions by Humor Flavor ──

export async function getCaptionsByFlavor(humorFlavorId: number) {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('captions')
    .select('id, created_datetime_utc, content, is_public, like_count, image_id')
    .eq('humor_flavor_id', humorFlavorId)
    .order('created_datetime_utc', { ascending: false })
    .limit(50)
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

// ── Reference Data ──

export async function getLlmModels() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('llm_models').select('id, name').order('id')
  return data ?? []
}

export async function getLlmInputTypes() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('llm_input_types').select('id, slug').order('id')
  return data ?? []
}

export async function getLlmOutputTypes() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('llm_output_types').select('id, slug').order('id')
  return data ?? []
}

export async function getHumorFlavorStepTypes() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('humor_flavor_step_types').select('id, slug').order('id')
  return data ?? []
}

// ── Test Flavor (generate captions via REST API) ──

export async function getTestImages() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from('images')
    .select('id, url, image_description')
    .eq('is_public', true)
    .order('created_datetime_utc', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function testHumorFlavor(formData: FormData) {
  const { supabase } = await requireAdmin()
  const imageId = String(formData.get('image_id') ?? '')
  const humorFlavorId = Number(formData.get('humor_flavor_id'))

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { error: 'No valid session. Please sign in again.', captions: null }
  }

  const API_BASE_URL = 'https://api.almostcrackd.ai'

  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId,
        humorFlavorId,
      }),
      cache: 'no-store',
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        error: `API error (${response.status}): ${JSON.stringify(body)}`,
        captions: null,
      }
    }

    return { error: null, captions: body }
  } catch (err) {
    return { error: `Network error: ${String(err)}`, captions: null }
  }
}
