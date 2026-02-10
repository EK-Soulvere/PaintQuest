import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveAttemptIdsForUser } from '@/lib/attempts/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const autoStart = Boolean(body.autoStart)

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const activeIds = await getActiveAttemptIdsForUser(supabase, user.id)
        if (activeIds.length > 0) {
            return NextResponse.json(
                { error: 'Another attempt is already in progress' },
                { status: 409 }
            )
        }

        const { data: attempt, error } = await supabase
            .from('attempt')
            .insert([{ user_id: user.id }])
            .select()
            .single()

        if (error || !attempt) {
            return NextResponse.json({ error: 'Failed to create attempt' }, { status: 400 })
        }

        if (autoStart) {
            const { error: eventError } = await supabase.from('progress_event').insert([
                {
                    attempt_id: attempt.id,
                    event_type: 'ATTEMPT_STARTED',
                    payload: null,
                },
            ])

            if (eventError) {
                return NextResponse.json({ error: 'Failed to start attempt' }, { status: 400 })
            }
        }

        return NextResponse.json({
            attempt,
            derivedState: autoStart ? 'IN_PROGRESS' : 'NONE',
        })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
