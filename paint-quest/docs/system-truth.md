## System Truth

## Sources of truth
- Identity: Supabase Auth user
- Data: Supabase Postgres
- Authorization: RLS policies

## Entities (v1)
### Attempt
- Owned by exactly one user
- Immutable truths:
    - attemptId
    - userId
    - taskId
    - createdAt

### Attempt Entry
- Belongs to a attempt and user
- Stored as flexible jsonb content

### ProgressEvent
- eventId
- attemptId
- eventType
- timestamp
- payload? (optional, domain-only)

## Rules:
Events are append-only
Attempts do not store state
No derived fields persisted
This is the non-negotiable core.

## FSM as the Authority (Key Engineering Contract)
Transition Table (v1)
NONE:
  ATTEMPT_STARTED -> IN_PROGRESS

IN_PROGRESS:
  PROGRESS_RECORDED -> IN_PROGRESS
  COMPLETED -> COMPLETED
  ABANDONED -> ABANDONED

COMPLETED:
  (terminal)

ABANDONED:
  (terminal)

## Rules:
- Anything not listed is invalid
- Terminal states allow no further events
- FSM is evaluated server-side only
- This table is the product.
- Everything else is a projection.

## Derivation Engine (The Heart of the System)
Core Function (Conceptual)
deriveAttemptState(attempt, events) -> {
  derivedState,
  reasoning,
  allowedActions
}

## Responsibilities
- Replay events in order
- Validate transitions against FSM
- Fail loudly on invalid sequences
- Produce a deterministic result

## Failure Outputs
INVALID
Clear reasoning string (human-readable)
No allowed actions
This is what makes the system trustworthy.

## Access rules
- A user can only read/write rows where user_id = auth.uid()
