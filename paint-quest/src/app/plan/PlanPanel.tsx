'use client'

import { useEffect, useState } from 'react'
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

interface PlanPanelProps {
    defaultMinutes?: number
    showStartButtons?: boolean
}

interface RecommendationMeta {
    hasTasks: boolean
    taskCount: number
    health?: {
        missingTimeRange: number
        missingTags: number
        lowPriority: number
    }
}

export default function PlanPanel({ defaultMinutes = 30, showStartButtons = true }: PlanPanelProps) {
    const [minutes, setMinutes] = useState(defaultMinutes)
    const [loading, setLoading] = useState(false)
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [error, setError] = useState<string | null>(null)
    const [meta, setMeta] = useState<RecommendationMeta | null>(null)
    const [seeding, setSeeding] = useState(false)
    const router = useRouter()

    useEffect(() => {
        void fetchRecommendations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            setMeta(data.meta || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const seedDefaults = async () => {
        setSeeding(true)
        try {
            const response = await fetch('/api/tasks/seed', { method: 'POST' })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to seed tasks')
            }
            await fetchRecommendations()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setSeeding(false)
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
                        {meta?.hasTasks === false
                            ? 'No tasks yet. Generate starter tasks to get recommendations.'
                            : 'No recommendations matched. Try a different time bucket or adjust task details.'}
                    </p>
                    {meta?.hasTasks ? (
                        <p className="text-xs text-[var(--color-text)] opacity-50 mt-2">
                            Tasks available: {meta.taskCount}
                        </p>
                    ) : null}
                    {meta?.hasTasks === false ? (
                        <button
                            onClick={seedDefaults}
                            disabled={seeding}
                            className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {seeding ? 'Generating...' : 'Generate 5 Starter Tasks'}
                        </button>
                    ) : null}
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
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => router.push(`/tasks/${rec.task.id}`)}
                                        className="text-sm text-[var(--color-secondary)] hover:underline"
                                    >
                                        Open
                                    </button>
                                    {showStartButtons ? (
                                        <button
                                            onClick={async () => {
                                                setLoading(true)
                                                setError(null)
                                                try {
                                                    const response = await fetch('/api/quests', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ taskId: rec.task.id }),
                                                    })
                                                    const data = await response.json()
                                                    if (!response.ok) {
                                                        throw new Error(data?.error || 'Failed to start quest')
                                                    }
                                                    router.push(`/sessions/${data.attempt.id}`)
                                                } catch (err) {
                                                    setError(err instanceof Error ? err.message : 'Unknown error')
                                                } finally {
                                                    setLoading(false)
                                                }
                                            }}
                                            className="text-sm px-3 py-1 border border-[var(--color-border)] rounded-md text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                                        >
                                            Start
                                        </button>
                                    ) : null}
                                </div>
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
            {meta?.health ? (
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] opacity-80">
                    <p className="font-medium text-[var(--color-secondary)] mb-2">Task Health</p>
                    <div className="flex flex-wrap gap-4">
                        <span>Missing time range: {meta.health.missingTimeRange}</span>
                        <span>Missing tags: {meta.health.missingTags}</span>
                        <span>
                            Low priority ({'<='}2): {meta.health.lowPriority}
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
