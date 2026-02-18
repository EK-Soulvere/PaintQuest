'use client'

import { useEffect, useState } from 'react'

interface Suggestion {
    template: {
        id: string
        title: string
        description: string | null
        estimated_minutes_min: number
        estimated_minutes_max: number
        energy: 'low' | 'med' | 'high'
        progress_value: string | null
    }
    reasons: string[]
}

interface GeneratedAttemptSuggestionsProps {
    taskId: string
}

export default function GeneratedAttemptSuggestions({ taskId }: GeneratedAttemptSuggestionsProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await fetch(
                    `/api/quests/${taskId}/attempt-recommendations?minutes=60&energy=med`
                )
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data?.error || 'Failed to load generated attempts')
                }
                setSuggestions(data.recommendations || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [taskId])

    return (
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">Generated Attempts</h2>
            <p className="text-sm text-[var(--color-text)] opacity-70">
                Recommended attempts are generated from your quest details.
            </p>

            {loading ? (
                <p className="text-sm text-[var(--color-text)] opacity-70">Loading...</p>
            ) : null}

            {error ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}

            {!loading && !error && suggestions.length === 0 ? (
                <p className="text-sm text-[var(--color-text)] opacity-70">
                    No generated attempts yet. Save your quest details and try again.
                </p>
            ) : null}

            <div className="space-y-3">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.template.id}
                        className="p-4 border border-[var(--color-border)] rounded-lg space-y-2"
                    >
                        <p className="font-semibold text-[var(--color-secondary)]">
                            {suggestion.template.title}
                        </p>
                        <p className="text-xs text-[var(--color-text)] opacity-70">
                            {suggestion.template.estimated_minutes_min}-
                            {suggestion.template.estimated_minutes_max} min |{' '}
                            {suggestion.template.energy} energy
                        </p>
                        {suggestion.template.progress_value ? (
                            <p className="text-xs text-[var(--color-text)] opacity-70">
                                Promise: {suggestion.template.progress_value}
                            </p>
                        ) : null}
                        <ul className="text-xs text-[var(--color-text)] opacity-70 space-y-1">
                            {suggestion.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
