import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/types/database.types'

type Task = Database['public']['Tables']['task']['Row']

export async function listTasks(): Promise<Task[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('task')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) throw new Error('Failed to load tasks')
    return data || []
}

export async function getTask(taskId: string): Promise<Task> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('task')
        .select('*')
        .eq('id', taskId)
        .single()

    if (error || !data) throw new Error('Task not found')
    return data
}

export async function createTask(task: Database['public']['Tables']['task']['Insert']) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const payload = normalizeTaskPayload(task)
    const { data, error } = await supabase
        .from('task')
        .insert([{ ...payload, user_id: user.id }])
        .select()
        .single()

    if (error || !data) throw new Error('Failed to create task')
    return data
}

export async function updateTask(taskId: string, updates: Database['public']['Tables']['task']['Update']) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const payload = normalizeTaskPayload(updates)
    const { data, error } = await supabase
        .from('task')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single()

    if (error || !data) throw new Error('Failed to update task')
    return data
}

export async function archiveTask(taskId: string) {
    return updateTask(taskId, { status: 'archived' })
}

function normalizeTaskPayload<T extends Database['public']['Tables']['task']['Insert'] | Database['public']['Tables']['task']['Update']>(
    payload: T
): T {
    const normalizeTags = (value: unknown): Json | null => {
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

    return {
        ...payload,
        required_tools_tags: normalizeTags(payload.required_tools_tags),
        skills_tags: normalizeTags(payload.skills_tags),
    }
}
