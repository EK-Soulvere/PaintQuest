import { describe, expect, it } from 'vitest'
import { recommendTasks } from './recommendTasks'

const baseTask = {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Paint basecoat',
    game: null,
    mfg: null,
    estimated_minutes_min: 30,
    estimated_minutes_max: 60,
    priority: 5,
    required_tools_tags: null,
    skills_tags: ['basecoat'],
    status: 'backlog',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
}

describe('recommendTasks', () => {
    it('returns top 5 tasks sorted by score', () => {
        const tasks = Array.from({ length: 6 }, (_, idx) => ({
            ...baseTask,
            id: `task-${idx}`,
            priority: idx + 1,
        }))

        const results = recommendTasks({
            tasks,
            attempts: [],
            availableMinutes: 45,
        })

        expect(results).toHaveLength(5)
        expect(results[0].task.priority).toBeGreaterThan(results[4].task.priority)
    })

    it('applies recency penalty for recently attempted tasks', () => {
        const tasks = [{ ...baseTask, id: 'task-1', priority: 5 }]
        const attempts = [
            {
                id: 'attempt-1',
                user_id: 'user-1',
                task_id: 'task-1',
                created_at: new Date().toISOString(),
            },
        ]

        const results = recommendTasks({
            tasks,
            attempts,
            availableMinutes: 45,
            config: {
                id: 'cfg-1',
                user_id: 'user-1',
                weight_priority: 1,
                weight_time_fit: 1,
                weight_skill_match: 1,
                weight_stale: 1,
                weight_recency_penalty: 1,
                stale_days_threshold: 14,
                recent_days_threshold: 3,
                focus_skills: ['basecoat'],
                created_at: '2026-02-01T00:00:00Z',
                updated_at: '2026-02-01T00:00:00Z',
            },
        })

        expect(results[0].reasons.some((r) => r.includes('recency penalty'))).toBe(true)
    })

    it('boosts stale tasks when not attempted recently', () => {
        const tasks = [{ ...baseTask, id: 'task-1', priority: 1 }]
        const attempts = [
            {
                id: 'attempt-1',
                user_id: 'user-1',
                task_id: 'task-1',
                created_at: '2025-12-01T00:00:00Z',
            },
        ]

        const results = recommendTasks({
            tasks,
            attempts,
            availableMinutes: 45,
        })

        expect(results[0].reasons.some((r) => r.includes('stale boost'))).toBe(true)
    })

    it('adds skill match reasons when focus skills exist', () => {
        const tasks = [{ ...baseTask, id: 'task-1', skills_tags: ['glaze'] }]
        const results = recommendTasks({
            tasks,
            attempts: [],
            availableMinutes: 45,
            config: {
                id: 'cfg-1',
                user_id: 'user-1',
                weight_priority: 1,
                weight_time_fit: 1,
                weight_skill_match: 1,
                weight_stale: 1,
                weight_recency_penalty: 1,
                stale_days_threshold: 14,
                recent_days_threshold: 3,
                focus_skills: ['glaze'],
                created_at: '2026-02-01T00:00:00Z',
                updated_at: '2026-02-01T00:00:00Z',
            },
        })

        expect(results[0].reasons.some((r) => r.includes('skill match'))).toBe(true)
    })
})
