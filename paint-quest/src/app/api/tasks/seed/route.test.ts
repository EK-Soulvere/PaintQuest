import { describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const createClient = vi.fn()

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
        from: vi.fn(() => ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({ data: [{ id: 'task-1' }], error: null }),
        })),
    }
}

describe('POST /api/tasks/seed', () => {
    it('seeds tasks', async () => {
        createClient.mockResolvedValueOnce(makeSupabaseStub())
        const response = await POST()
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.tasks).toHaveLength(1)
    })
})
