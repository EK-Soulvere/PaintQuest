import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET, PATCH, DELETE } from './route'

const getTask = vi.fn()
const updateTask = vi.fn()
const archiveTask = vi.fn()

vi.mock('@/lib/tasks/server', () => ({
    getTask: (...args: unknown[]) => getTask(...args),
    updateTask: (...args: unknown[]) => updateTask(...args),
    archiveTask: (...args: unknown[]) => archiveTask(...args),
}))

describe('GET /api/tasks/[taskId]', () => {
    beforeEach(() => {
        getTask.mockReset()
        updateTask.mockReset()
        archiveTask.mockReset()
    })

    it('returns task', async () => {
        getTask.mockResolvedValueOnce({ id: 'task-1' })
        const response = await GET(new Request('http://localhost'), {
            params: Promise.resolve({ taskId: 'task-1' }),
        })
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.task.id).toBe('task-1')
    })

    it('returns 404 on error', async () => {
        getTask.mockRejectedValueOnce(new Error('Nope'))
        const response = await GET(new Request('http://localhost'), {
            params: Promise.resolve({ taskId: 'task-1' }),
        })
        const body = await response.json()
        expect(response.status).toBe(404)
        expect(body.error).toBe('Nope')
    })
})

describe('PATCH /api/tasks/[taskId]', () => {
    beforeEach(() => {
        getTask.mockReset()
        updateTask.mockReset()
        archiveTask.mockReset()
    })

    it('updates task', async () => {
        updateTask.mockResolvedValueOnce({ id: 'task-1', title: 'Updated' })
        const request = new Request('http://localhost', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Updated' }),
        })
        const response = await PATCH(request, {
            params: Promise.resolve({ taskId: 'task-1' }),
        })
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.task.title).toBe('Updated')
    })
})

describe('DELETE /api/tasks/[taskId]', () => {
    beforeEach(() => {
        getTask.mockReset()
        updateTask.mockReset()
        archiveTask.mockReset()
    })

    it('archives task', async () => {
        archiveTask.mockResolvedValueOnce({ id: 'task-1', status: 'archived' })
        const response = await DELETE(new Request('http://localhost'), {
            params: Promise.resolve({ taskId: 'task-1' }),
        })
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.task.status).toBe('archived')
    })
})
