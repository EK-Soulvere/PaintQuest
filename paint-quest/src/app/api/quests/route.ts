import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const taskId = body.taskId as string

        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data: attempt, error } = await supabase
            .from('attempt')
            .insert([{ user_id: user.id, task_id: taskId }])
            .select()
            .single()

        if (error || !attempt) {
            return NextResponse.json({ error: 'Failed to create quest' }, { status: 400 })
        }

        return NextResponse.json({ attempt })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
