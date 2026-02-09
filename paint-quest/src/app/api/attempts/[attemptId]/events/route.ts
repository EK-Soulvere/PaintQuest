import { NextResponse } from 'next/server'
import { addProgressEvent } from '@/lib/attempts/server'
import type { EventType } from '@/lib/fsm/deriveAttemptState'
import type { Json } from '@/lib/types/database.types'

const allowedEventTypes: EventType[] = [
    'ATTEMPT_STARTED',
    'PROGRESS_RECORDED',
    'COMPLETED',
    'ABANDONED',
]

export async function POST(
    request: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    try {
        const body = await request.json()
        const eventType = body.eventType as EventType
        const payload = (body.payload ?? null) as Json | null
        const { attemptId } = await params

        if (!allowedEventTypes.includes(eventType)) {
            return NextResponse.json(
                { error: 'Invalid event type' },
                { status: 400 }
            )
        }

        await addProgressEvent({
            attemptId,
            eventType,
            payload,
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
