import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

const listTasks = vi.fn()
const createTask = vi.fn()

vi.mock('@/lib/tasks/server', () => ({
    listTasks: (...args: unknown[]) => listTasks(...args),
    createTask: (...args: unknown[]) => createTask(...args),
}))

describe('GET /api/tasks', () => {
    beforeEach(() => {
        listTasks.mockReset()
        createTask.mockReset()
    })

    it('returns tasks', async () => {
        listTasks.mockResolvedValueOnce([{ id: 'task-1' }])
        const response = await GET()
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.tasks).toHaveLength(1)
    })

    it('handles errors', async () => {
        listTasks.mockRejectedValueOnce(new Error('Fail'))
        const response = await GET()
        const body = await response.json()
        expect(response.status).toBe(400)
        expect(body.error).toBe('Fail')
    })
})

describe('POST /api/tasks', () => {
    beforeEach(() => {
        listTasks.mockReset()
        createTask.mockReset()
    })

    it('creates a task', async () => {
        createTask.mockResolvedValueOnce({ id: 'task-1' })
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Task' }),
        })
        const response = await POST(request)
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.task.id).toBe('task-1')
    })
})
