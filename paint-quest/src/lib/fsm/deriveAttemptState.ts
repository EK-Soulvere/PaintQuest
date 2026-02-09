export type AttemptState = 'NONE' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'INVALID'
export type EventType =
    | 'ATTEMPT_STARTED'
    | 'PROGRESS_RECORDED'
    | 'COMPLETED'
    | 'ABANDONED'

const transitions: Record<AttemptState, Partial<Record<EventType, AttemptState>>> = {
    NONE: {
        ATTEMPT_STARTED: 'IN_PROGRESS',
    },
    IN_PROGRESS: {
        PROGRESS_RECORDED: 'IN_PROGRESS',
        COMPLETED: 'COMPLETED',
        ABANDONED: 'ABANDONED',
    },
    COMPLETED: {},
    ABANDONED: {},
    INVALID: {},
}

export interface DerivedAttemptState {
    derivedState: AttemptState
    reasoning: string
    allowedActions: EventType[]
}

export interface ProgressEventLike {
    event_type: EventType | string
    timestamp: string
}

function allowedActionsFor(state: AttemptState): EventType[] {
    return Object.keys(transitions[state] || {}) as EventType[]
}

export function deriveAttemptState(
    events: ProgressEventLike[]
): DerivedAttemptState {
    const ordered = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    let state: AttemptState = 'NONE'

    for (const event of ordered) {
        const eventType = event.event_type as EventType
        const next = transitions[state]?.[eventType]
        if (!next) {
            return {
                derivedState: 'INVALID',
                reasoning: `Invalid transition: ${state} -> ${event.event_type}`,
                allowedActions: [],
            }
        }
        state = next
    }

    return {
        derivedState: state,
        reasoning:
            ordered.length === 0
                ? 'No events yet. Awaiting ATTEMPT_STARTED.'
                : `Derived from ${ordered.length} event(s).`,
        allowedActions: allowedActionsFor(state),
    }
}
