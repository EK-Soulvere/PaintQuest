'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventType } from '@/lib/fsm/deriveAttemptState'

interface QuestActionsProps {
    attemptId: string
    allowedActions: EventType[]
}

export default function QuestActions({ attemptId, allowedActions }: QuestActionsProps) {
    const [note, setNote] = useState('')
    const [minutes, setMinutes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const canProgress = allowedActions.includes('PROGRESS_RECORDED')
    const canComplete = allowedActions.includes('COMPLETED')
    const canAbandon = allowedActions.includes('ABANDONED')

    const postEvent = async (eventType: EventType, payload: Record<string, unknown> | null) => {
        const response = await fetch(`/api/attempts/${attemptId}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType, payload }),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.error || 'Failed to record event')
        }
    }

    const recordProgress = async () => {
        setLoading(true)
        setError(null)
        try {
            if (!canProgress) {
                throw new Error('Progress is not allowed right now')
            }
            const minutesValue = minutes ? Number(minutes) : null
            if (!note.trim() && !minutesValue) {
                throw new Error('Add a note or minutes for progress')
            }
            await postEvent('PROGRESS_RECORDED', {
                note: note.trim() || null,
                minutes: minutesValue,
            })
            setNote('')
            setMinutes('')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const complete = async () => {
        setLoading(true)
        setError(null)
        try {
            await postEvent('COMPLETED', null)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const abandon = async () => {
        setLoading(true)
        setError(null)
        try {
            await postEvent('ABANDONED', null)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Progress Note</label>
                <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    placeholder="What changed?"
                    disabled={!canProgress || loading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Minutes</label>
                <input
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    placeholder="e.g. 25"
                    inputMode="numeric"
                    disabled={!canProgress || loading}
                />
            </div>

            {error ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}

            <div className="flex flex-col md:flex-row gap-3">
                <button
                    onClick={recordProgress}
                    disabled={loading || !canProgress}
                    className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Record Progress
                </button>
                <button
                    onClick={complete}
                    disabled={loading || !canComplete}
                    className="px-4 py-2 border border-[var(--color-tertiary)] text-[var(--color-tertiary)] font-semibold rounded-md hover:bg-[var(--color-tertiary)]/10 transition-colors disabled:opacity-50"
                >
                    Complete
                </button>
                <button
                    onClick={abandon}
                    disabled={loading || !canAbandon}
                    className="px-4 py-2 border border-red-500/60 text-red-400 font-semibold rounded-md hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                    Abandon
                </button>
            </div>
        </div>
    )
}
