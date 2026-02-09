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
