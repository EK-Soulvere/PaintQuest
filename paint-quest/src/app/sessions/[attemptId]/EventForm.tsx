'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const eventTypes = [
    'ATTEMPT_STARTED',
    'PROGRESS_RECORDED',
    'COMPLETED',
    'ABANDONED',
] as const

type EventType = (typeof eventTypes)[number]

interface EventFormProps {
    attemptId: string
}

export default function EventForm({ attemptId }: EventFormProps) {
    const [eventType, setEventType] = useState<EventType>('PROGRESS_RECORDED')
    const [note, setNote] = useState('')
    const [minutes, setMinutes] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            let payload: Record<string, unknown> | null = null

            if (eventType === 'PROGRESS_RECORDED') {
                const minutesValue = minutes ? Number(minutes) : null
                if (!note.trim() && !minutesValue) {
                    throw new Error('Add a note or minutes for progress')
                }
                payload = {
                    note: note.trim() || null,
                    minutes: minutesValue,
                }
            }

            const response = await fetch(`/api/attempts/${attemptId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, payload }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to record event')
            }

            setNote('')
            setMinutes('')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                >
                    {eventTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {eventType === 'PROGRESS_RECORDED' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-2">Note</label>
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                            placeholder="What changed?"
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
                        />
                    </div>
                </>
            ) : null}

            {error ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Record Event'}
            </button>
        </form>
    )
}
