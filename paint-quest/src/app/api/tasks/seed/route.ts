import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TASKS } from '@/lib/tasks/defaultTasks'

export async function POST() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const payload = DEFAULT_TASKS.map((task) => ({
            ...task,
            user_id: user.id,
        }))

        const { data, error } = await supabase.from('task').insert(payload).select()
        if (error) {
            return NextResponse.json({ error: 'Failed to seed tasks' }, { status: 400 })
        }

        return NextResponse.json({ tasks: data || [] })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
