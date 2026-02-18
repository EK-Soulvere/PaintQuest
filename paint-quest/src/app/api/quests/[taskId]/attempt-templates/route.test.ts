import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

const createClient = vi.fn()
const authGetUser = vi.fn()
const order = vi.fn()
const single = vi.fn()
const insert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
    createClient: (...args: unknown[]) => createClient(...args),
}))

function makeSupabaseStub() {
    return {
        auth: {
            getUser: authGetUser,
        },
        from: vi.fn((table: string) => {
            if (table !== 'quest_attempt_template') {
                throw new Error(`unexpected table ${table}`)
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order,
                insert,
                single,
            }
        }),
    }
}

describe('GET /api/quests/[taskId]/attempt-templates', () => {
    beforeEach(() => {
        createClient.mockReset()
        authGetUser.mockReset()
        order.mockReset()
        insert.mockReset()
        single.mockReset()
    })

    it('returns templates', async () => {
        authGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
        order.mockResolvedValueOnce({ data: [{ id: 'tpl-1' }], error: null })
        createClient.mockResolvedValueOnce(makeSupabaseStub())

        const response = await GET(new Request('http://localhost'), {
            params: Promise.resolve({ taskId: 'task-1' }),
        })
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.templates).toHaveLength(1)
    })
})

describe('POST /api/quests/[taskId]/attempt-templates', () => {
    beforeEach(() => {
        createClient.mockReset()
        authGetUser.mockReset()
        order.mockReset()
        insert.mockReset()
        single.mockReset()
    })

    it('creates a template', async () => {
        authGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
        insert.mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                    data: { id: 'tpl-1', title: 'Basecoat pass' },
                    error: null,
                }),
            }),
        })
        createClient.mockResolvedValueOnce(makeSupabaseStub())

        const response = await POST(
            new Request('http://localhost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Basecoat pass',
                    estimated_minutes_min: 20,
                    estimated_minutes_max: 40,
                    energy: 'med',
                    required_tools_tags: [],
                    focus_skills_tags: [],
                }),
            }),
            { params: Promise.resolve({ taskId: 'task-1' }) }
        )
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.template.id).toBe('tpl-1')
    })
})
