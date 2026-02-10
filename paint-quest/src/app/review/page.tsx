import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { deriveAttemptState } from '@/lib/fsm/deriveAttemptState'

export default async function ReviewPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: attempts, error: attemptsError } = await supabase
        .from('attempt')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (attemptsError || !attempts) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[var(--color-text)]">Failed to load attempts.</p>
                </div>
            </div>
        )
    }

    const attemptIds = attempts.map((attempt) => attempt.id)
    const { data: events } = await supabase
        .from('progress_event')
        .select('attempt_id,event_type,timestamp')
        .in('attempt_id', attemptIds)
        .order('timestamp', { ascending: true })

    const eventsByAttempt = new Map<string, { event_type: string; timestamp: string }[]>()
    for (const event of events || []) {
        const list = eventsByAttempt.get(event.attempt_id) || []
        list.push({ event_type: event.event_type, timestamp: event.timestamp })
        eventsByAttempt.set(event.attempt_id, list)
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const completedThisWeek: { id: string; completedAt: string }[] = []

    for (const attempt of attempts) {
        const derived = deriveAttemptState(eventsByAttempt.get(attempt.id) || [])
        if (derived.derivedState !== 'COMPLETED') continue

        const attemptEvents = eventsByAttempt.get(attempt.id) || []
        const completedEvent = [...attemptEvents].reverse().find((e) => e.event_type === 'COMPLETED')
        if (!completedEvent) continue

        const completedDate = new Date(completedEvent.timestamp)
        if (completedDate >= sevenDaysAgo) {
            completedThisWeek.push({ id: attempt.id, completedAt: completedEvent.timestamp })
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                        Weekly Review
                    </h1>
                    <p className="text-[var(--color-text)] opacity-70">
                        Completed quests in the last 7 days.
                    </p>
                </div>

                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <p className="text-3xl font-bold text-[var(--color-secondary)]">
                        {completedThisWeek.length}
                    </p>
                    <p className="text-sm text-[var(--color-text)] opacity-70">
                        quests completed this week
                    </p>
                </div>

                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                        Completed Quests
                    </h2>
                    {completedThisWeek.length === 0 ? (
                        <p className="text-[var(--color-text)] opacity-70">No completions yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {completedThisWeek.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="p-3 border border-[var(--color-border)] rounded-md"
                                >
                                    <p className="text-sm font-medium text-[var(--color-primary)]">
                                        Attempt #{attempt.id.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-[var(--color-text)] opacity-60">
                                        Completed {new Date(attempt.completedAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
