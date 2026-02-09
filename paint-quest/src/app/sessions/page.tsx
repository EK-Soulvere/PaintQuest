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

    const attemptsWithState = await Promise.all(
        (attempts || []).map(async (attempt) => {
            const { data: events } = await supabase
                .from('progress_event')
                .select('event_type,timestamp')
                .eq('attempt_id', attempt.id)
                .order('timestamp', { ascending: true })

            const derived = deriveAttemptState(events || [])
            return { ...attempt, derivedState: derived.derivedState }
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
