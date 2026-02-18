'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SuggestedAttempt {
    template: {
        id: string
        title: string
        description: string | null
        estimated_minutes_min: number
        estimated_minutes_max: number
        energy: 'low' | 'med' | 'high'
        progress_value: string | null
    }
    score: number
    reasons: string[]
    recommendedMinutes: number
}

interface SuggestedAttemptsProps {
    attemptId: string
    taskId: string | null
    canRecordProgress: boolean
    defaultMinutes?: number
    defaultEnergy?: 'low' | 'med' | 'high'
}

const timeBuckets = [15, 30, 45, 60, 90, 120]
const energyOptions: Array<'low' | 'med' | 'high'> = ['low', 'med', 'high']

export default function SuggestedAttempts({
    attemptId,
    taskId,
    canRecordProgress,
    defaultMinutes = 60,
    defaultEnergy = 'med',
}: SuggestedAttemptsProps) {
    const [minutes, setMinutes] = useState(defaultMinutes)
    const [energy, setEnergy] = useState<'low' | 'med' | 'high'>(defaultEnergy)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<SuggestedAttempt[]>([])
    const router = useRouter()

    const loadSuggestions = async () => {
        if (!taskId) return
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `/api/quests/${taskId}/attempt-recommendations?minutes=${minutes}&energy=${energy}`
            )
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to load suggested attempts')
            }
            setSuggestions(data.recommendations || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadSuggestions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId])

    const startSuggestedAttempt = async (suggestion: SuggestedAttempt) => {
        try {
            const response = await fetch(`/api/attempts/${attemptId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'PROGRESS_RECORDED',
                    payload: {
                        template_id: suggestion.template.id,
                        template_title: suggestion.template.title,
                        promise: suggestion.template.progress_value,
                        recommended_minutes: suggestion.recommendedMinutes,
                        source: 'attempt_recommendation',
                        note: suggestion.template.description,
                    },
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to start suggested attempt')
            }
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    if (!taskId) {
        return (
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                <p className="text-sm text-[var(--color-text)] opacity-70">
                    Suggested attempts are available for quests linked to a backlog item.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-[var(--color-text)] opacity-70">Time</label>
                <select
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                >
                    {timeBuckets.map((bucket) => (
                        <option key={bucket} value={bucket}>
                            {bucket} min
                        </option>
                    ))}
                </select>

                <label className="text-sm text-[var(--color-text)] opacity-70">Energy</label>
                <select
                    value={energy}
                    onChange={(e) => setEnergy(e.target.value as 'low' | 'med' | 'high')}
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                >
                    {energyOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <button
                    onClick={loadSuggestions}
                    disabled={loading}
                    className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] rounded-md font-semibold disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Refresh Suggestions'}
                </button>
            </div>

            {error ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}

            {suggestions.length === 0 ? (
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <p className="text-sm text-[var(--color-text)] opacity-70">
                        No suggested attempts found for the current time and energy.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.template.id}
                            className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-2"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-semibold text-[var(--color-secondary)]">
                                        {suggestion.template.title}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text)] opacity-60">
                                        {suggestion.template.estimated_minutes_min}-
                                        {suggestion.template.estimated_minutes_max} min •{' '}
                                        {suggestion.template.energy} energy
                                    </p>
                                </div>
                                <button
                                    onClick={() => startSuggestedAttempt(suggestion)}
                                    disabled={!canRecordProgress}
                                    className="px-3 py-1 text-sm border border-[var(--color-border)] rounded-md text-[var(--color-text)] hover:bg-[var(--color-surface)] disabled:opacity-50"
                                >
                                    Start This Attempt
                                </button>
                            </div>
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
            )}
        </div>
    )
}
