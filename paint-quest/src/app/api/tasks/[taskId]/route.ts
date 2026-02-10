import { NextResponse } from 'next/server'
import { getTask, updateTask, archiveTask } from '@/lib/tasks/server'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params
        const task = await getTask(taskId)
        return NextResponse.json({ task })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 404 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params
        const body = await request.json()
        const task = await updateTask(taskId, body)
        return NextResponse.json({ task })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params
        const task = await archiveTask(taskId)
        return NextResponse.json({ task })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
