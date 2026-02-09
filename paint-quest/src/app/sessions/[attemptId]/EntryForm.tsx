'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const entryTypes = ['note', 'check', 'timer'] as const
type EntryType = (typeof entryTypes)[number]

interface EntryFormProps {
    attemptId: string
}

export default function EntryForm({ attemptId }: EntryFormProps) {
    const [entryType, setEntryType] = useState<EntryType>('note')
    const [note, setNote] = useState('')
    const [checkLabel, setCheckLabel] = useState('')
    const [checkValue, setCheckValue] = useState(false)
    const [timerLabel, setTimerLabel] = useState('')
    const [timerMinutes, setTimerMinutes] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            let content: Record<string, unknown>

            if (entryType === 'note') {
                if (!note.trim()) {
                    throw new Error('Note is required')
                }
                content = { text: note.trim() }
            } else if (entryType === 'check') {
                if (!checkLabel.trim()) {
                    throw new Error('Check label is required')
                }
                content = { label: checkLabel.trim(), checked: checkValue }
            } else {
                const minutesValue = timerMinutes ? Number(timerMinutes) : null
                if (!timerLabel.trim() || !minutesValue) {
                    throw new Error('Timer label and minutes are required')
                }
                content = { label: timerLabel.trim(), minutes: minutesValue }
            }

            const response = await fetch(`/api/attempts/${attemptId}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entryType,
                    content,
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to add entry')
            }

            setNote('')
            setCheckLabel('')
            setCheckValue(false)
            setTimerLabel('')
            setTimerMinutes('')
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
                <label className="block text-sm font-medium mb-2">Entry Type</label>
                <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as EntryType)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                >
                    {entryTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {entryType === 'note' ? (
                <div>
                    <label className="block text-sm font-medium mb-2">Note</label>
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="Quick note"
                    />
                </div>
            ) : null}

            {entryType === 'check' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-2">Label</label>
                        <input
                            value={checkLabel}
                            onChange={(e) => setCheckLabel(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                            placeholder="What are you checking?"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={checkValue}
                            onChange={(e) => setCheckValue(e.target.checked)}
                        />
                        Completed
                    </label>
                </>
            ) : null}

            {entryType === 'timer' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-2">Label</label>
                        <input
                            value={timerLabel}
                            onChange={(e) => setTimerLabel(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                            placeholder="Timer label"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Minutes</label>
                        <input
                            value={timerMinutes}
                            onChange={(e) => setTimerMinutes(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                            placeholder="e.g. 15"
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
                {loading ? 'Saving...' : 'Add Entry'}
            </button>
        </form>
    )
}
