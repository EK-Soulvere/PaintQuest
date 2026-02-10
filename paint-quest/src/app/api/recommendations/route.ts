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

        const { data: profile } = await supabase
            .from('profile')
            .select('*')
            .maybeSingle()

        const { data: arsenal } = await supabase
            .from('arsenal_item')
            .select('*')
            .eq('available', true)

        const recommendations = recommendTasks({
            tasks: tasks || [],
            attempts: attempts || [],
            availableMinutes,
            config,
            profile,
            arsenal: arsenal || [],
        })

        const tasksList = tasks || []
        const missingTimeRange = tasksList.filter(
            (task) => task.estimated_minutes_min == null || task.estimated_minutes_max == null
        ).length
        const missingTags = tasksList.filter((task) => {
            const required = Array.isArray(task.required_tools_tags)
                ? task.required_tools_tags
                : []
            const skills = Array.isArray(task.skills_tags) ? task.skills_tags : []
            return required.length === 0 && skills.length === 0
        }).length
        const lowPriority = tasksList.filter((task) => task.priority <= 2).length

        const debug = searchParams.get('debug') === '1'
        if (debug) {
            console.log('recommendations_debug', {
                availableMinutes,
                taskCount: tasksList.length,
                recommendations: recommendations.map((rec) => ({
                    id: rec.task.id,
                    title: rec.task.title,
                    score: rec.score,
                    reasons: rec.reasons,
                })),
            })
        }

        return NextResponse.json({
            recommendations,
            meta: {
                hasTasks: tasksList.length > 0,
                taskCount: tasksList.length,
                health: {
                    missingTimeRange,
                    missingTags,
                    lowPriority,
                },
            },
            debug: debug
                ? recommendations.map((rec) => ({
                      id: rec.task.id,
                      title: rec.task.title,
                      score: rec.score,
                      reasons: rec.reasons,
                  }))
                : undefined,
        })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
