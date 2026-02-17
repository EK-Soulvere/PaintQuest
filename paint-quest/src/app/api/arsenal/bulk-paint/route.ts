import { NextResponse } from 'next/server'
import { createBulkPaintItems } from '@/lib/arsenal/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const rows = Array.isArray(body.rows) ? body.rows : []
        const items = await createBulkPaintItems(rows)
        return NextResponse.json({ items, inserted: items.length })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
