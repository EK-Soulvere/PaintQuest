'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const timeBuckets = [15, 30, 45, 60, 90, 120]

interface Recommendation {
    task: {
        id: string
        title: string
        priority: number
        estimated_minutes_min: number | null
        estimated_minutes_max: number | null
    }
    score: number
    reasons: string[]
}

export default function PlanPanel() {
    const [minutes, setMinutes] = useState(30)
    const [loading, setLoading] = useState(false)
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fetchRecommendations = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/recommendations?minutes=${minutes}`)
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to load recommendations')
            }
            setRecommendations(data.recommendations || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
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
                </div>
                <button
                    onClick={fetchRecommendations}
                    disabled={loading}
                    className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Get Recommendations'}
                </button>
            </div>

            {error ? (
                <div className="p-3 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}

            {recommendations.length === 0 ? (
                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <p className="text-[var(--color-text)] opacity-70">
                        No recommendations yet. Create tasks first.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recommendations.map((rec) => (
                        <div
                            key={rec.task.id}
                            className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                                        {rec.task.title}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text)] opacity-60">
                                        Priority {rec.task.priority} •{' '}
                                        {rec.task.estimated_minutes_min ?? '?'}-
                                        {rec.task.estimated_minutes_max ?? '?'} min
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push(`/tasks/${rec.task.id}`)}
                                    className="text-sm text-[var(--color-secondary)] hover:underline"
                                >
                                    Open
                                </button>
                            </div>
                            <ul className="text-xs text-[var(--color-text)] opacity-70 space-y-1">
                                {rec.reasons.map((reason) => (
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
