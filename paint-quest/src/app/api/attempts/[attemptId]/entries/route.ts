import { NextResponse } from 'next/server'
import { addAttemptEntry } from '@/lib/attempts/server'
import type { Json } from '@/lib/types/database.types'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    try {
        const body = await request.json()
        const entryType = typeof body.entryType === 'string' ? body.entryType.trim() : ''
        const content = body.content as Json
        const { attemptId } = await params

        if (!entryType) {
            return NextResponse.json(
                { error: 'Entry type is required' },
                { status: 400 }
            )
        }

        if (content === null || content === undefined) {
            return NextResponse.json(
                { error: 'Entry content is required' },
                { status: 400 }
            )
        }

        await addAttemptEntry({
            attemptId,
            entryType,
            content,
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
