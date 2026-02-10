import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recommendTasks } from '@/lib/recommend/recommendTasks'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const availableMinutes = Number(searchParams.get('minutes') || '0')
        if (!availableMinutes || availableMinutes <= 0) {
            return NextResponse.json({ error: 'minutes is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data: tasks, error: tasksError } = await supabase
            .from('task')
            .select('*')
            .neq('status', 'archived')

        if (tasksError) {
            return NextResponse.json({ error: 'Failed to load tasks' }, { status: 400 })
        }

        const { data: attempts, error: attemptsError } = await supabase
            .from('attempt')
            .select('*')

        if (attemptsError) {
            return NextResponse.json({ error: 'Failed to load attempts' }, { status: 400 })
        }

        const { data: config } = await supabase
            .from('recommendation_config')
            .select('*')
            .maybeSingle()

        const recommendations = recommendTasks({
            tasks: tasks || [],
            attempts: attempts || [],
            availableMinutes,
            config,
        })

        return NextResponse.json({ recommendations })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
