import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

const getProfile = vi.fn()
const upsertProfile = vi.fn()

vi.mock('@/lib/profile/server', () => ({
    getProfile: (...args: unknown[]) => getProfile(...args),
    upsertProfile: (...args: unknown[]) => upsertProfile(...args),
}))

describe('GET /api/profile', () => {
    beforeEach(() => {
        getProfile.mockReset()
        upsertProfile.mockReset()
    })

    it('returns profile', async () => {
        getProfile.mockResolvedValueOnce({ id: 'profile-1' })
        const response = await GET()
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.profile.id).toBe('profile-1')
    })
})

describe('POST /api/profile', () => {
    beforeEach(() => {
        getProfile.mockReset()
        upsertProfile.mockReset()
    })

    it('upserts profile', async () => {
        upsertProfile.mockResolvedValueOnce({ id: 'profile-1' })
        const request = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media: ['acrylic'] }),
        })
        const response = await POST(request)
        const body = await response.json()
        expect(response.status).toBe(200)
        expect(body.profile.id).toBe('profile-1')
    })
})
