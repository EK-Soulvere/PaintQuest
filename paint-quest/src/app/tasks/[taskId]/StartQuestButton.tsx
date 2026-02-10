'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StartQuestButtonProps {
    taskId: string
}

export default function StartQuestButton({ taskId }: StartQuestButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const start = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/quests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to start quest')
            }
            router.push(`/sessions/${data.attempt.id}`)
        } catch (error) {
            console.error(error)
            alert('Failed to start quest')
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
            {loading ? 'Starting...' : 'Start quest'}
        </button>
    )
}
