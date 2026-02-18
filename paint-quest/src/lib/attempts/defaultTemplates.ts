import type { Database } from '@/lib/types/database.types'

type InsertTemplate = Database['public']['Tables']['quest_attempt_template']['Insert']

export function buildQuestSpecificAttemptTemplates(params: {
    userId: string
    taskId: string
    questTitle: string
}): InsertTemplate[] {
    const { userId, taskId, questTitle } = params

    const questSpecific: InsertTemplate[] = [
        {
            user_id: userId,
            task_id: taskId,
            title: `${questTitle}: Prep + Basecoat pass`,
            description: 'Block in base colors for the next chunk of models.',
            estimated_minutes_min: 25,
            estimated_minutes_max: 45,
            energy: 'low',
            required_tools_tags: ['round brush'],
            focus_skills_tags: ['basecoating'],
            progress_value: 'Base layers complete on 2-3 models',
            is_system_generated: true,
        },
        {
            user_id: userId,
            task_id: taskId,
            title: `${questTitle}: Shade + Cleanup`,
            description: 'Apply washes and cleanup transitions on key panels.',
            estimated_minutes_min: 30,
            estimated_minutes_max: 60,
            energy: 'med',
            required_tools_tags: ['round brush', 'detail brush'],
            focus_skills_tags: ['washing', 'layering'],
            progress_value: 'Shadows and cleanup done for one unit section',
            is_system_generated: true,
        },
        {
            user_id: userId,
            task_id: taskId,
            title: `${questTitle}: Highlight push`,
            description: 'Edge highlight focal details to push finish quality.',
            estimated_minutes_min: 30,
            estimated_minutes_max: 75,
            energy: 'high',
            required_tools_tags: ['highlight brush', 'detail brush'],
            focus_skills_tags: ['highlighting', 'blending'],
            progress_value: 'Visible finish upgrade on key models',
            is_system_generated: true,
        },
        {
            user_id: userId,
            task_id: taskId,
            title: `${questTitle}: Detail cleanup`,
            description: 'Sharpen panel lines and tidy spillover from earlier layers.',
            estimated_minutes_min: 20,
            estimated_minutes_max: 40,
            energy: 'low',
            required_tools_tags: ['detail brush'],
            focus_skills_tags: ['basecoating', 'layering'],
            progress_value: 'Cleaner details across one model group',
            is_system_generated: true,
        },
        {
            user_id: userId,
            task_id: taskId,
            title: `${questTitle}: Basing progress pass`,
            description: 'Advance base texture and tones for a subset of models.',
            estimated_minutes_min: 25,
            estimated_minutes_max: 50,
            energy: 'med',
            required_tools_tags: ['drybrush'],
            focus_skills_tags: ['basing', 'drybrushing'],
            progress_value: 'Bases advanced for 2-3 models',
            is_system_generated: true,
        },
        {
            user_id: userId,
            task_id: taskId,
            title: `${questTitle}: Glaze refinement`,
            description: 'Smooth rough transitions and unify target color zones.',
            estimated_minutes_min: 30,
            estimated_minutes_max: 55,
            energy: 'high',
            required_tools_tags: ['round brush'],
            focus_skills_tags: ['glazing', 'blending'],
            progress_value: 'Smoother transitions on key surfaces',
            is_system_generated: true,
        },
    ]

    return questSpecific
}

function buildGenericSkillTemplates(params: { userId: string }): InsertTemplate[] {
    const { userId } = params
    return [
        {
            user_id: userId,
            task_id: null,
            title: '5 model highlighting practice',
            description: 'Practice controlled highlights on five small areas.',
            estimated_minutes_min: 20,
            estimated_minutes_max: 45,
            energy: 'med',
            required_tools_tags: ['highlight brush'],
            focus_skills_tags: ['highlighting'],
            progress_value: 'Improved highlight consistency',
            is_system_generated: true,
        },
        {
            user_id: userId,
            task_id: null,
            title: 'Layering transition drill',
            description: 'Build smooth transitions on armor panels.',
            estimated_minutes_min: 25,
            estimated_minutes_max: 50,
            energy: 'med',
            required_tools_tags: ['round brush'],
            focus_skills_tags: ['layering', 'glazing'],
            progress_value: 'Smoother transitions across test area',
            is_system_generated: true,
        },
    ]
}

export function buildDefaultQuestAttemptTemplates(params: {
    userId: string
    taskId: string
    questTitle: string
}): InsertTemplate[] {
    return [
        ...buildQuestSpecificAttemptTemplates(params),
        ...buildGenericSkillTemplates({ userId: params.userId }),
    ]
}
