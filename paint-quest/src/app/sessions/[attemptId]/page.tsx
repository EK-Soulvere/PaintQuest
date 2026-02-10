import { getAttemptDetails } from '@/lib/attempts/server'
import { notFound } from 'next/navigation'
import QuestActions from './QuestActions'
import Link from 'next/link'
import StartAttemptButton from './StartAttemptButton'

export default async function AttemptDetailPage({
    params,
}: {
    params: Promise<{ attemptId: string }>
}) {
    const { attemptId } = await params
    let details
    try {
        details = await getAttemptDetails(attemptId)
    } catch {
        notFound()
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <Link
                        href="/sessions"
                        className="inline-block mb-4 text-sm text-[var(--color-secondary)] hover:underline"
                    >
                        ← Back to Sessions
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                        Attempt #{details.attempt.id.slice(0, 8)}
                    </h1>
                    <p className="text-[var(--color-text)] opacity-70">
                        Created {new Date(details.attempt.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
                        Derived State
                    </h2>
                    <p className="text-[var(--color-text)] mb-2">
                        {details.derived.derivedState}
                    </p>
                    <p className="text-sm text-[var(--color-text)] opacity-70 mb-4">
                        {details.derived.reasoning}
                    </p>
                    {details.derived.derivedState === 'NONE' ? (
                        <div className="mb-4">
                            <StartAttemptButton attemptId={details.attempt.id} />
                        </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                        {details.derived.allowedActions.length === 0 ? (
                            <span className="text-sm text-[var(--color-text)] opacity-60">
                                No actions available
                            </span>
                        ) : (
                            details.derived.allowedActions.map((action) => (
                                <span
                                    key={action}
                                    className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)]"
                                >
                                    {action}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                        Quest Actions
                    </h2>
                    <QuestActions
                        attemptId={details.attempt.id}
                        allowedActions={details.derived.allowedActions}
                    />
                </div>

                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-4">
                        Event History
                    </h2>
                    {details.events.length === 0 ? (
                        <p className="text-[var(--color-text)] opacity-70">No events yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {details.events.map((event) => (
                                <div
                                    key={event.event_id}
                                    className="p-3 border border-[var(--color-border)] rounded-md"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-primary)]">
                                                {event.event_type}
                                            </p>
                                            <p className="text-xs text-[var(--color-text)] opacity-60">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {event.payload ? (
                                        <pre className="mt-2 text-xs text-[var(--color-text)] opacity-80 whitespace-pre-wrap">
                                            {JSON.stringify(event.payload, null, 2)}
                                        </pre>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
