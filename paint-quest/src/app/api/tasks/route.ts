import { NextResponse } from 'next/server'
import { createTask, listTasks } from '@/lib/tasks/server'

export async function GET() {
    try {
        const tasks = await listTasks()
        return NextResponse.json({ tasks })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const task = await createTask(body)
        return NextResponse.json({ task })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
