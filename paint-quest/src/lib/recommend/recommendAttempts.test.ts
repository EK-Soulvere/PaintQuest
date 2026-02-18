import { describe, expect, it } from 'vitest'
import { recommendAttempts } from './recommendAttempts'

const baseTemplate = {
    id: 'tpl-1',
    user_id: 'user-1',
    task_id: 'task-1',
    title: 'Edge highlight 2 models',
    description: null,
    estimated_minutes_min: 30,
    estimated_minutes_max: 60,
    energy: 'med' as const,
    required_tools_tags: ['highlight brush'],
    focus_skills_tags: ['highlighting'],
    progress_value: '2 models highlighted',
    is_system_generated: true,
    created_at: '2026-02-18T00:00:00Z',
    updated_at: '2026-02-18T00:00:00Z',
}

describe('recommendAttempts', () => {
    it('returns top suggestions with reasons', () => {
        const recs = recommendAttempts({
            templates: [baseTemplate],
            availableMinutes: 45,
            energy: 'med',
            bottomSkills: ['highlighting'],
            availableToolTags: ['highlight brush'],
            recentTemplateIds: [],
        })

        expect(recs).toHaveLength(1)
        expect(recs[0].reasons.some((r) => r.includes('time fit'))).toBe(true)
        expect(recs[0].reasons.some((r) => r.includes('energy fit'))).toBe(true)
    })

    it('penalizes missing tools and recent templates', () => {
        const recs = recommendAttempts({
            templates: [baseTemplate],
            availableMinutes: 45,
            energy: 'med',
            bottomSkills: [],
            availableToolTags: [],
            recentTemplateIds: ['tpl-1'],
        })

        expect(recs[0].reasons.some((r) => r.includes('missing tools'))).toBe(true)
        expect(recs[0].reasons.some((r) => r.includes('recently used'))).toBe(true)
    })
})
