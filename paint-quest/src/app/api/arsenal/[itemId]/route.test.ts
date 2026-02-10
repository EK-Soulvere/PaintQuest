import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PATCH, DELETE } from './route'

const updateArsenalItem = vi.fn()
const deleteArsenalItem = vi.fn()

vi.mock('@/lib/arsenal/server', () => ({
    updateArsenalItem: (...args: unknown[]) => updateArsenalItem(...args),
    deleteArsenalItem: (...args: unknown[]) => deleteArsenalItem(...args),
}))

describe('PATCH /api/arsenal/[itemId]', () => {
    beforeEach(() => {
        updateArsenalItem.mockReset()
        deleteArsenalItem.mockReset()
    })

    it('updates item', async () => {
        updateArsenalItem.mockResolvedValueOnce({ id: 'item-1', name: 'Updated' })
        const request = new Request('http://localhost', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated' }),
        })
        const response = await PATCH(request, {
            params: Promise.resolve({ itemId: 'item-1' }),
        })
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.item.name).toBe('Updated')
    })
})

describe('DELETE /api/arsenal/[itemId]', () => {
    beforeEach(() => {
        updateArsenalItem.mockReset()
        deleteArsenalItem.mockReset()
    })

    it('deletes item', async () => {
        deleteArsenalItem.mockResolvedValueOnce({ id: 'item-1' })
        const response = await DELETE(new Request('http://localhost'), {
            params: Promise.resolve({ itemId: 'item-1' }),
        })
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.item.id).toBe('item-1')
    })
})
