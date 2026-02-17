import { NextResponse } from 'next/server'
import { buildOpenApiSpec } from '@/lib/openapi/spec'

export async function GET(request: Request) {
    const origin = new URL(request.url).origin
    return NextResponse.json(buildOpenApiSpec(origin))
}
