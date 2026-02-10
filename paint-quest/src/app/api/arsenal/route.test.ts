import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

const listArsenal = vi.fn()
const createArsenalItem = vi.fn()

vi.mock('@/lib/arsenal/server', () => ({
    listArsenal: (...args: unknown[]) => listArsenal(...args),
    createArsenalItem: (...args: unknown[]) => createArsenalItem(...args),
}))

describe('GET /api/arsenal', () => {
    beforeEach(() => {
        listArsenal.mockReset()
        createArsenalItem.mockReset()
    })

    it('returns items', async () => {
        listArsenal.mockResolvedValueOnce([{ id: 'item-1' }])
        const response = await GET()
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.items).toHaveLength(1)
    })
})

describe('POST /api/arsenal', () => {
    beforeEach(() => {
        listArsenal.mockReset()
        createArsenalItem.mockReset()
    })

    it('creates an item', async () => {
        createArsenalItem.mockResolvedValueOnce({ id: 'item-1' })
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Brush', category: 'brush' }),
        })
        const response = await POST(request)
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.item.id).toBe('item-1')
    })
})
