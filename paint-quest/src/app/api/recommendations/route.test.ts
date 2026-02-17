import { describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const recommendTasks = vi.fn()
const createClient = vi.fn()

vi.mock('@/lib/recommend/recommendTasks', () => ({
    recommendTasks: (...args: unknown[]) => recommendTasks(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
    createClient: (...args: unknown[]) => createClient(...args),
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
                    in: vi.fn().mockResolvedValue({
                        data: [
                            {
                                id: 'task-1',
                                estimated_minutes_min: 30,
                                estimated_minutes_max: 60,
                                required_tools_tags: [],
                                skills_tags: [],
                                priority: 3,
                            },
                        ],
                        error: null,
                    }),
                }
            }
            if (table === 'attempt') {
                return {
                    select: vi.fn().mockResolvedValue({ data: [], error: null }),
                }
            }
            if (table === 'recommendation_config') {
                return {
                    select: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }
            }
            if (table === 'profile') {
                return {
                    select: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }
            }
            if (table === 'arsenal_item') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                }
            }
            return {
                select: vi.fn().mockResolvedValue({ data: [], error: null }),
            }
        }),
    }
}

describe('GET /api/recommendations', () => {
    it('requires minutes', async () => {
        const response = await GET(new Request('http://localhost/api/recommendations'))
        const body = await response.json()
        expect(response.status).toBe(400)
        expect(body.error).toBe('minutes is required')
    })

    it('returns recommendations', async () => {
        recommendTasks.mockReturnValueOnce([{ task: { id: 'task-1' }, score: 1, reasons: [] }])
        createClient.mockResolvedValueOnce(makeSupabaseStub())

        const response = await GET(
            new Request('http://localhost/api/recommendations?minutes=30')
        )
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.recommendations).toHaveLength(1)
        expect(body.meta.hasTasks).toBe(true)
        expect(body.meta.health).toBeDefined()
    })
})
