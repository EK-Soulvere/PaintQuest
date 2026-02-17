import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SessionsList from './SessionsList'
import LogoutButton from './LogoutButton'
import { deriveAttemptState } from '@/lib/fsm/deriveAttemptState'

export default async function SessionsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: attempts, error } = await supabase
        .from('attempt')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching attempts:', error)
    }

    const taskIds = (attempts || [])
        .map((attempt) => attempt.task_id)
        .filter((id): id is string => Boolean(id))

    const taskTitleMap = new Map<string, string>()
    if (taskIds.length > 0) {
        const { data: tasks } = await supabase
            .from('task')
            .select('id,title')
            .in('id', Array.from(new Set(taskIds)))

        for (const task of tasks || []) {
            taskTitleMap.set(task.id, task.title)
        }
    }

    const attemptSequenceMap = new Map<string, number>()
    const attemptsByTask = new Map<string, { id: string; created_at: string }[]>()
    for (const attempt of attempts || []) {
        if (!attempt.task_id) continue
        const list = attemptsByTask.get(attempt.task_id) || []
        list.push({ id: attempt.id, created_at: attempt.created_at })
        attemptsByTask.set(attempt.task_id, list)
    }

    for (const list of attemptsByTask.values()) {
        const ordered = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
        ordered.forEach((row, idx) => {
            attemptSequenceMap.set(row.id, idx + 1)
        })
    }

    const attemptsWithState = await Promise.all(
        (attempts || []).map(async (attempt) => {
            const { data: events } = await supabase
                .from('progress_event')
                .select('event_type,timestamp')
                .eq('attempt_id', attempt.id)
                .order('timestamp', { ascending: true })

            const derived = deriveAttemptState(events || [])
            const taskTitle = attempt.task_id ? taskTitleMap.get(attempt.task_id) : null
            const sequence = attemptSequenceMap.get(attempt.id)
            const displayTitle = taskTitle
                ? `${taskTitle} - Quest Attempt - #${sequence ?? 1}`
                : `Attempt #${attempt.id.slice(0, 8)}`

            return { ...attempt, derivedState: derived.derivedState, displayTitle }
        })
    )

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                            Your Sessions
                        </h1>
                        <p className="text-[var(--color-text)] opacity-70">
                            Logged in as {user.email}
                        </p>
                    </div>
                    <LogoutButton />
                </div>

                <SessionsList initialAttempts={attemptsWithState} />
            </div>
        </div>
    )
}
