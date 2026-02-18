import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('quest_attempt_template')
            .select('*')
            .eq('user_id', user.id)
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: 'Failed to load templates' }, { status: 400 })
        }

        return NextResponse.json({ templates: data || [] })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params
        const body = await request.json()
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('quest_attempt_template')
            .insert([
                {
                    user_id: user.id,
                    task_id: taskId,
                    title: body.title,
                    description: body.description ?? null,
                    estimated_minutes_min: body.estimated_minutes_min,
                    estimated_minutes_max: body.estimated_minutes_max,
                    energy: body.energy,
                    required_tools_tags: body.required_tools_tags ?? [],
                    focus_skills_tags: body.focus_skills_tags ?? [],
                    progress_value: body.progress_value ?? null,
                    is_system_generated: false,
                },
            ])
            .select('*')
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Failed to create template' }, { status: 400 })
        }

        return NextResponse.json({ template: data })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
