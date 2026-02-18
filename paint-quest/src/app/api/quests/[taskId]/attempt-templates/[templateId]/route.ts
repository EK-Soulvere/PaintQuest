import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ taskId: string; templateId: string }> }
) {
    try {
        const { taskId, templateId } = await params
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
            .update({
                title: body.title,
                description: body.description ?? null,
                estimated_minutes_min: body.estimated_minutes_min,
                estimated_minutes_max: body.estimated_minutes_max,
                energy: body.energy,
                required_tools_tags: body.required_tools_tags ?? [],
                focus_skills_tags: body.focus_skills_tags ?? [],
                progress_value: body.progress_value ?? null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', templateId)
            .eq('task_id', taskId)
            .eq('user_id', user.id)
            .select('*')
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Failed to update template' }, { status: 400 })
        }

        return NextResponse.json({ template: data })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ taskId: string; templateId: string }> }
) {
    try {
        const { taskId, templateId } = await params
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('quest_attempt_template')
            .delete()
            .eq('id', templateId)
            .eq('task_id', taskId)
            .eq('user_id', user.id)
            .select('*')
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Failed to delete template' }, { status: 400 })
        }

        return NextResponse.json({ template: data })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
