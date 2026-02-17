import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/types/database.types'

type ArsenalItem = Database['public']['Tables']['arsenal_item']['Row']

function normalizeTags(value: unknown): Json | null {
    if (!value) return null
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
        const parts = value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        return parts.length > 0 ? parts : null
    }
    return value as Json
}

export async function listArsenal(): Promise<ArsenalItem[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('arsenal_item')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) throw new Error('Failed to load arsenal')
    return data || []
}

export async function createArsenalItem(item: Database['public']['Tables']['arsenal_item']['Insert']) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const payload = {
        ...item,
        user_id: user.id,
        tags: normalizeTags(item.tags),
    }

    const { data, error } = await supabase
        .from('arsenal_item')
        .insert([payload])
        .select()
        .single()

    if (error || !data) throw new Error('Failed to create arsenal item')
    return data
}

export async function updateArsenalItem(
    itemId: string,
    updates: Database['public']['Tables']['arsenal_item']['Update']
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const payload = {
        ...updates,
        tags: normalizeTags(updates.tags),
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from('arsenal_item')
        .update(payload)
        .eq('id', itemId)
        .select()
        .single()

    if (error || !data) throw new Error('Failed to update arsenal item')
    return data
}

export async function deleteArsenalItem(itemId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('arsenal_item')
        .delete()
        .eq('id', itemId)
        .select()
        .single()

    if (error || !data) throw new Error('Failed to delete arsenal item')
    return data
}

export async function createBulkPaintItems(
    rows: Array<{
        color: string
        brand?: string | null
        medium?: string | null
        available?: boolean
    }>
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const payload = rows
        .filter((row) => row.color.trim().length > 0)
        .map((row) => {
            const tags = [row.brand?.trim(), row.medium?.trim()].filter(Boolean) as string[]
            return {
                user_id: user.id,
                category: 'paint',
                name: row.color.trim(),
                tags,
                available: row.available ?? true,
            }
        })

    if (payload.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from('arsenal_item')
        .insert(payload)
        .select('*')

    if (error) {
        throw new Error('Failed to bulk import paint items')
    }

    return data || []
}
