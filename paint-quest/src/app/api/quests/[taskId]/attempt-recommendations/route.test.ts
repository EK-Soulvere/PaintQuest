import { describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const createClient = vi.fn()
const recommendAttempts = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
    createClient: (...args: unknown[]) => createClient(...args),
}))

vi.mock('@/lib/recommend/recommendAttempts', () => ({
    recommendAttempts: (...args: unknown[]) => recommendAttempts(...args),
}))

function makeSupabaseStub() {
    return {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'user-1' } },
            }),
        },
        from: vi.fn((table: string) => {
            if (table === 'task') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: { id: 'task-1', title: 'Quest' }, error: null }),
                }
            }
            if (table === 'profile') {
                return {
                    select: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: { focus_skills_bottom3: ['highlighting'], energy_preference: 'med' },
                        error: null,
                    }),
                }
            }
            if (table === 'quest_attempt_template') {
                const templates = [
                    {
                        id: 'tpl-1',
                        user_id: 'user-1',
                        task_id: 'task-1',
                        title: 'Attempt',
                        description: null,
                        estimated_minutes_min: 20,
                        estimated_minutes_max: 45,
                        energy: 'med',
                        required_tools_tags: [],
                        focus_skills_tags: [],
                        progress_value: null,
                        is_system_generated: true,
                        created_at: '2026-02-18T00:00:00Z',
                        updated_at: '2026-02-18T00:00:00Z',
                    },
                ]
                const chainedQuery = {
                    eq: vi.fn().mockResolvedValue({ data: templates, error: null }),
                    or: vi.fn().mockResolvedValue({ data: templates, error: null }),
                }
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnValue(chainedQuery),
                    insert: vi.fn().mockResolvedValue({}),
                }
            }
            if (table === 'arsenal_item') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                }
            }
            if (table === 'attempt') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    data: [],
                }
            }
            if (table === 'progress_event') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }
            }
            return {
                select: vi.fn().mockResolvedValue({ data: [], error: null }),
            }
        }),
    }
}

describe('GET /api/quests/[taskId]/attempt-recommendations', () => {
    it('returns recommendations for a quest', async () => {
        recommendAttempts.mockReturnValueOnce([
            { template: { id: 'tpl-1', title: 'Attempt' }, score: 2, reasons: [], recommendedMinutes: 30 },
        ])
        createClient.mockResolvedValueOnce(makeSupabaseStub())

        const response = await GET(
            new Request('http://localhost/api/quests/task-1/attempt-recommendations?minutes=30&energy=med'),
            { params: Promise.resolve({ taskId: 'task-1' }) }
        )
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.recommendations).toHaveLength(1)
    })
})
