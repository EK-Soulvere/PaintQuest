import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'

const createBulkPaintItems = vi.fn()

vi.mock('@/lib/arsenal/server', () => ({
    createBulkPaintItems: (...args: unknown[]) => createBulkPaintItems(...args),
}))

describe('POST /api/arsenal/bulk-paint', () => {
    beforeEach(() => {
        createBulkPaintItems.mockReset()
    })

    it('imports rows and returns inserted count', async () => {
        createBulkPaintItems.mockResolvedValueOnce([{ id: 'paint-1' }, { id: 'paint-2' }])
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rows: [
                    { color: 'Blue', brand: 'Vallejo', medium: 'Acrylic' },
                    { color: 'Black', brand: 'Citadel', medium: 'Contrast' },
                ],
            }),
        })
        const response = await POST(request)
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.inserted).toBe(2)
    })
})
