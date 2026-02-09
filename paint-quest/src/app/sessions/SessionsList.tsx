'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'
import type { AttemptState } from '@/lib/fsm/deriveAttemptState'
import Link from 'next/link'

type Attempt = Database['public']['Tables']['attempt']['Row']
type AttemptWithState = Attempt & { derivedState: AttemptState }

interface SessionsListProps {
    initialAttempts: AttemptWithState[]
}

export default function SessionsList({ initialAttempts }: SessionsListProps) {
    const [attempts, setAttempts] = useState<AttemptWithState[]>(initialAttempts)
    const [creating, setCreating] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const createAttempt = async () => {
        setCreating(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('attempt')
                .insert([{ user_id: user.id }])
                .select()
                .single()

            if (error) throw error

            if (data) {
                // Create initial ATTEMPT_STARTED event
                await supabase.from('progress_event').insert([
                    {
                        attempt_id: data.id,
                        event_type: 'ATTEMPT_STARTED',
                        payload: null,
                    },
                ])

                setAttempts([{ ...data, derivedState: 'IN_PROGRESS' }, ...attempts])
                router.refresh()
            }
        } catch (error) {
            console.error('Error creating attempt:', error)
            alert('Failed to create attempt')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <button
                onClick={createAttempt}
                disabled={creating}
                className="mb-6 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {creating ? 'Creating...' : '+ New Attempt'}
            </button>

            {attempts.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <p className="text-[var(--color-text)] opacity-70">
                        No attempts yet. Create your first one!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {attempts.map((attempt) => (
                        <Link
                            key={attempt.id}
                            href={`/sessions/${attempt.id}`}
                            className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-1">
                                        Attempt #{attempt.id.slice(0, 8)}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text)] opacity-60">
                                        Created {new Date(attempt.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)] text-xs font-medium rounded-full">
                                    {attempt.derivedState}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
