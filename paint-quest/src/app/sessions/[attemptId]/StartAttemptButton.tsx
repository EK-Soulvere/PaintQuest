'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StartAttemptButtonProps {
    attemptId: string
}

export default function StartAttemptButton({ attemptId }: StartAttemptButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const start = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/attempts/${attemptId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType: 'ATTEMPT_STARTED', payload: null }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to start attempt')
            }
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to start attempt')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={start}
            disabled={loading}
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
            {loading ? 'Starting...' : 'Start attempt'}
        </button>
    )
}
