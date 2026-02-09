import { describe, expect, it } from 'vitest'
import { deriveAttemptState } from './deriveAttemptState'

describe('deriveAttemptState', () => {
    it('returns NONE when no events exist', () => {
        const derived = deriveAttemptState([])
        expect(derived.derivedState).toBe('NONE')
        expect(derived.allowedActions).toEqual(['ATTEMPT_STARTED'])
    })

    it('moves to IN_PROGRESS after ATTEMPT_STARTED', () => {
        const derived = deriveAttemptState([
            { event_type: 'ATTEMPT_STARTED', timestamp: '2026-02-09T10:00:00Z' },
        ])
        expect(derived.derivedState).toBe('IN_PROGRESS')
        expect(derived.allowedActions).toEqual([
            'PROGRESS_RECORDED',
            'COMPLETED',
            'ABANDONED',
        ])
    })

    it('stays IN_PROGRESS after PROGRESS_RECORDED', () => {
        const derived = deriveAttemptState([
            { event_type: 'ATTEMPT_STARTED', timestamp: '2026-02-09T10:00:00Z' },
            { event_type: 'PROGRESS_RECORDED', timestamp: '2026-02-09T10:05:00Z' },
        ])
        expect(derived.derivedState).toBe('IN_PROGRESS')
    })

    it('moves to COMPLETED and prevents further actions', () => {
        const derived = deriveAttemptState([
            { event_type: 'ATTEMPT_STARTED', timestamp: '2026-02-09T10:00:00Z' },
            { event_type: 'COMPLETED', timestamp: '2026-02-09T10:10:00Z' },
        ])
        expect(derived.derivedState).toBe('COMPLETED')
        expect(derived.allowedActions).toEqual([])
    })

    it('rejects invalid transitions', () => {
        const derived = deriveAttemptState([
            { event_type: 'COMPLETED', timestamp: '2026-02-09T10:10:00Z' },
        ])
        expect(derived.derivedState).toBe('INVALID')
        expect(derived.allowedActions).toEqual([])
    })
})
