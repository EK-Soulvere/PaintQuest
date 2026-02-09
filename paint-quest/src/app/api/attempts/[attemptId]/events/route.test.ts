import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'

const addProgressEvent = vi.fn()

vi.mock('@/lib/attempts/server', () => ({
    addProgressEvent: (...args: unknown[]) => addProgressEvent(...args),
}))

describe('POST /api/attempts/[attemptId]/events', () => {
    beforeEach(() => {
        addProgressEvent.mockReset()
    })

    it('rejects invalid event types', async () => {
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType: 'BAD', payload: null }),
        })

        const response = await POST(request, { params: { attemptId: 'abc' } })
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Invalid event type')
        expect(addProgressEvent).not.toHaveBeenCalled()
    })

    it('calls addProgressEvent for valid events', async () => {
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType: 'COMPLETED', payload: null }),
        })

        const response = await POST(request, { params: { attemptId: 'attempt-1' } })
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(addProgressEvent).toHaveBeenCalledWith({
            attemptId: 'attempt-1',
            eventType: 'COMPLETED',
            payload: null,
        })
    })

    it('returns error when addProgressEvent fails', async () => {
        addProgressEvent.mockRejectedValueOnce(new Error('Nope'))

        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType: 'ABANDONED', payload: null }),
        })

        const response = await POST(request, { params: { attemptId: 'attempt-2' } })
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Nope')
    })
})
