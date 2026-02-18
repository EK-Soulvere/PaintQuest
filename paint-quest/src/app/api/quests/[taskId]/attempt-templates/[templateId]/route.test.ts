import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE, PATCH } from './route'

const createClient = vi.fn()
const authGetUser = vi.fn()
const update = vi.fn()
const remove = vi.fn()

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
                update,
                delete: remove,
            }
        }),
    }
}

describe('PATCH /api/quests/[taskId]/attempt-templates/[templateId]', () => {
    beforeEach(() => {
        createClient.mockReset()
        authGetUser.mockReset()
        update.mockReset()
        remove.mockReset()
    })

    it('updates template', async () => {
        authGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
        update.mockReturnValueOnce({
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                    data: { id: 'tpl-1', title: 'Updated' },
                    error: null,
                }),
            }),
        })
        createClient.mockResolvedValueOnce(makeSupabaseStub())

        const response = await PATCH(
            new Request('http://localhost', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Updated',
                    estimated_minutes_min: 20,
                    estimated_minutes_max: 40,
                    energy: 'low',
                    required_tools_tags: [],
                    focus_skills_tags: [],
                }),
            }),
            { params: Promise.resolve({ taskId: 'task-1', templateId: 'tpl-1' }) }
        )
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.template.title).toBe('Updated')
    })
})

describe('DELETE /api/quests/[taskId]/attempt-templates/[templateId]', () => {
    beforeEach(() => {
        createClient.mockReset()
        authGetUser.mockReset()
        update.mockReset()
        remove.mockReset()
    })

    it('deletes template', async () => {
        authGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
        remove.mockReturnValueOnce({
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                    data: { id: 'tpl-1' },
                    error: null,
                }),
            }),
        })
        createClient.mockResolvedValueOnce(makeSupabaseStub())

        const response = await DELETE(new Request('http://localhost'), {
            params: Promise.resolve({ taskId: 'task-1', templateId: 'tpl-1' }),
        })
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.template.id).toBe('tpl-1')
    })
})
