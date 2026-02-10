import { NextResponse } from 'next/server'
import { listArsenal, createArsenalItem } from '@/lib/arsenal/server'

export async function GET() {
    try {
        const items = await listArsenal()
        return NextResponse.json({ items })
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
        const item = await createArsenalItem(body)
        return NextResponse.json({ item })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
