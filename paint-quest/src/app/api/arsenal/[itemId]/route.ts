import { NextResponse } from 'next/server'
import { updateArsenalItem, deleteArsenalItem } from '@/lib/arsenal/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params
        const body = await request.json()
        const item = await updateArsenalItem(itemId, body)
        return NextResponse.json({ item })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params
        const item = await deleteArsenalItem(itemId)
        return NextResponse.json({ item })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
