import { NextResponse } from 'next/server'
import { getProfile, upsertProfile } from '@/lib/profile/server'

export async function GET() {
    try {
        const profile = await getProfile()
        return NextResponse.json({ profile })
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
        const profile = await upsertProfile(body)
        return NextResponse.json({ profile })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
