import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
    buildDefaultQuestAttemptTemplates,
    buildQuestSpecificAttemptTemplates,
} from '@/lib/attempts/defaultTemplates'
import { recommendAttempts } from '@/lib/recommend/recommendAttempts'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params
        const { searchParams } = new URL(request.url)
        const availableMinutes = Math.max(1, Number(searchParams.get('minutes') || '60'))
        const requestedEnergy = searchParams.get('energy') as 'low' | 'med' | 'high' | null

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data: task, error: taskError } = await supabase
            .from('task')
            .select('id,title')
            .eq('id', taskId)
            .single()

        if (taskError || !task) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
        }

        const { data: profile } = await supabase
            .from('profile')
            .select('focus_skills_bottom3,energy_preference')
            .maybeSingle()

        const energy = requestedEnergy || (profile?.energy_preference as 'low' | 'med' | 'high' | null) || 'med'

        const { data: attempts } = await supabase
            .from('attempt')
            .select('id')
            .eq('task_id', taskId)
            .eq('user_id', user.id)

        const attemptIds = (attempts || []).map((a) => a.id)
        let usedTemplateIds: string[] = []
        let recentTemplateIds: string[] = []
        if (attemptIds.length > 0) {
            const { data: allProgressEvents } = await supabase
                .from('progress_event')
                .select('payload,timestamp')
                .eq('event_type', 'PROGRESS_RECORDED')
                .in('attempt_id', attemptIds)
                .order('timestamp', { ascending: false })

            usedTemplateIds = (allProgressEvents || [])
                .map((event) => {
                    if (!event.payload || typeof event.payload !== 'object') return null
                    const payload = event.payload as { template_id?: string }
                    return payload.template_id || null
                })
                .filter((id): id is string => Boolean(id))
            recentTemplateIds = usedTemplateIds.slice(0, 20)
        }
        const usedTemplateSet = new Set(usedTemplateIds)

        const { data: existingTaskTemplates } = await supabase
            .from('quest_attempt_template')
            .select('*')
            .eq('user_id', user.id)
            .eq('task_id', taskId)

        const taskTemplates = existingTaskTemplates || []
        const availableTaskTemplateCount = taskTemplates.filter(
            (template) => !usedTemplateSet.has(template.id)
        ).length
        if (availableTaskTemplateCount < 3) {
            const questDefaults = buildQuestSpecificAttemptTemplates({
                userId: user.id,
                taskId,
                questTitle: task.title,
            })
            const existingTitles = new Set(taskTemplates.map((template) => template.title))
            const toInsert = questDefaults
                .filter((template) => !existingTitles.has(template.title))
                .slice(0, 3 - availableTaskTemplateCount)

            if (toInsert.length > 0) {
                await supabase.from('quest_attempt_template').insert(toInsert)
            }
        }

        let { data: templates } = await supabase
            .from('quest_attempt_template')
            .select('*')
            .eq('user_id', user.id)
            .or(`task_id.eq.${taskId},task_id.is.null`)

        if (!templates || templates.length === 0) {
            const defaults = buildDefaultQuestAttemptTemplates({
                userId: user.id,
                taskId,
                questTitle: task.title,
            })

            await supabase.from('quest_attempt_template').insert(defaults)

            const reload = await supabase
                .from('quest_attempt_template')
                .select('*')
                .eq('user_id', user.id)
                .or(`task_id.eq.${taskId},task_id.is.null`)
            templates = reload.data || []
        }

        const unplayedTemplates = (templates || []).filter(
            (template) => !usedTemplateSet.has(template.id)
        )

        const { data: arsenal } = await supabase
            .from('arsenal_item')
            .select('tags')
            .eq('available', true)

        const availableToolTags = (arsenal || [])
            .flatMap((item) => (Array.isArray(item.tags) ? item.tags.map(String) : []))

        const bottomSkills = Array.isArray(profile?.focus_skills_bottom3)
            ? profile.focus_skills_bottom3.map(String)
            : []

        const recommendations = recommendAttempts({
            templates: unplayedTemplates,
            availableMinutes,
            energy,
            bottomSkills,
            availableToolTags,
            recentTemplateIds,
        })

        return NextResponse.json({
            recommendations,
            meta: {
                questId: taskId,
                availableMinutes,
                energy,
                templateCount: unplayedTemplates.length,
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
