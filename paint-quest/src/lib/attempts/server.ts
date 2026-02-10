import { createClient } from '@/lib/supabase/server'
import { deriveAttemptState, type EventType } from '@/lib/fsm/deriveAttemptState'
import type { Database, Json } from '@/lib/types/database.types'

type Attempt = Database['public']['Tables']['attempt']['Row']
type ProgressEvent = Database['public']['Tables']['progress_event']['Row']
type AttemptEntry = Database['public']['Tables']['attempt_entry']['Row']

export interface AttemptDetails {
    attempt: Attempt
    events: ProgressEvent[]
    entries: AttemptEntry[]
    derived: ReturnType<typeof deriveAttemptState>
}

export async function getAttemptDetails(attemptId: string): Promise<AttemptDetails> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: attempt, error: attemptError } = await supabase
        .from('attempt')
        .select('*')
        .eq('id', attemptId)
        .single()

    if (attemptError || !attempt) {
        throw new Error('Attempt not found')
    }

    const { data: events, error: eventsError } = await supabase
        .from('progress_event')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('timestamp', { ascending: true })

    if (eventsError) {
        throw new Error('Failed to load events')
    }

    const { data: entries, error: entriesError } = await supabase
        .from('attempt_entry')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('created_at', { ascending: false })

    if (entriesError) {
        throw new Error('Failed to load entries')
    }

    const derived = deriveAttemptState(events || [])

    return {
        attempt,
        events: events || [],
        entries: entries || [],
        derived,
    }
}

export async function startAttempt(attemptId: string) {
    return addProgressEvent({
        attemptId,
        eventType: 'ATTEMPT_STARTED',
        payload: null,
    })
}

export async function addProgressEvent(params: {
    attemptId: string
    eventType: EventType
    payload: Json | null
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: events, error: eventsError } = await supabase
        .from('progress_event')
        .select('*')
        .eq('attempt_id', params.attemptId)
        .order('timestamp', { ascending: true })

    if (eventsError) {
        throw new Error('Failed to load events')
    }

    const derived = deriveAttemptState(events || [])
    if (derived.derivedState === 'INVALID') {
        throw new Error(derived.reasoning)
    }

    if (!derived.allowedActions.includes(params.eventType)) {
        throw new Error(`Action not allowed: ${params.eventType}`)
    }

    if (params.eventType === 'ATTEMPT_STARTED') {
        const activeIds = await getActiveAttemptIdsForUser(supabase, user.id)
        const otherActive = activeIds.filter((id) => id !== params.attemptId)
        if (otherActive.length > 0) {
            throw new Error('Another attempt is already in progress')
        }
    }

    const { error: insertError } = await supabase.from('progress_event').insert([
        {
            attempt_id: params.attemptId,
            event_type: params.eventType,
            payload: params.payload,
        },
    ])

    if (insertError) {
        throw new Error('Failed to record event')
    }

    if (params.eventType === 'COMPLETED' || params.eventType === 'ABANDONED') {
        const { data: attempt } = await supabase
            .from('attempt')
            .select('task_id')
            .eq('id', params.attemptId)
            .single()

        if (attempt?.task_id) {
            const nextStatus = params.eventType === 'COMPLETED' ? 'done' : 'archived'
            await supabase
                .from('task')
                .update({ status: nextStatus, updated_at: new Date().toISOString() })
                .eq('id', attempt.task_id)
        }
    }
}

export async function getActiveAttemptIdsForUser(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
) {
    const { data: attempts, error } = await supabase
        .from('attempt')
        .select('id,created_at,task_id')
        .eq('user_id', userId)

    if (error || !attempts) {
        return []
    }

    const attemptIds = attempts.map((attempt) => attempt.id)
    if (attemptIds.length === 0) {
        return []
    }

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

    const active: string[] = []
    for (const attempt of attempts) {
        const derived = deriveAttemptState(eventsByAttempt.get(attempt.id) || [])
        if (derived.derivedState === 'IN_PROGRESS') {
            active.push(attempt.id)
        }
    }

    return active
}

export async function getActiveAttemptForUser() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: attempts, error } = await supabase
        .from('attempt')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error || !attempts || attempts.length === 0) {
        return null
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

    for (const attempt of attempts) {
        const derived = deriveAttemptState(eventsByAttempt.get(attempt.id) || [])
        if (derived.derivedState === 'IN_PROGRESS') {
            return { attempt, derived }
        }
    }

    return null
}

export async function addAttemptEntry(params: {
    attemptId: string
    entryType: string
    content: Json
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase.from('attempt_entry').insert([
        {
            attempt_id: params.attemptId,
            user_id: user.id,
            entry_type: params.entryType,
            content: params.content,
        },
    ])

    if (error) {
        throw new Error('Failed to create entry')
    }
}
