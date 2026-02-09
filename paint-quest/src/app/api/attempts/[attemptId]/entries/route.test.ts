import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'

const addAttemptEntry = vi.fn()

vi.mock('@/lib/attempts/server', () => ({
    addAttemptEntry: (...args: unknown[]) => addAttemptEntry(...args),
}))

describe('POST /api/attempts/[attemptId]/entries', () => {
    beforeEach(() => {
        addAttemptEntry.mockReset()
    })

    it('requires entry type', async () => {
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entryType: '', content: { text: 'hi' } }),
        })

        const response = await POST(request, { params: Promise.resolve({ attemptId: 'attempt-1' }) })
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Entry type is required')
        expect(addAttemptEntry).not.toHaveBeenCalled()
    })

    it('requires content', async () => {
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entryType: 'note' }),
        })

        const response = await POST(request, { params: Promise.resolve({ attemptId: 'attempt-1' }) })
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Entry content is required')
        expect(addAttemptEntry).not.toHaveBeenCalled()
    })

    it('calls addAttemptEntry for valid payload', async () => {
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entryType: 'note',
                content: { text: 'hello' },
            }),
        })

        const response = await POST(request, { params: Promise.resolve({ attemptId: 'attempt-2' }) })
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.ok).toBe(true)
        expect(addAttemptEntry).toHaveBeenCalledWith({
            attemptId: 'attempt-2',
            entryType: 'note',
            content: { text: 'hello' },
        })
    })

    it('returns error when addAttemptEntry fails', async () => {
        addAttemptEntry.mockRejectedValueOnce(new Error('Failed'))

        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entryType: 'note',
                content: { text: 'hello' },
            }),
        })

        const response = await POST(request, { params: Promise.resolve({ attemptId: 'attempt-3' }) })
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Failed')
    })
})
