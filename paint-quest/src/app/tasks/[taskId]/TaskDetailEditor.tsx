'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'

type Task = Database['public']['Tables']['task']['Row']

const statusOptions = ['backlog', 'active', 'done', 'someday', 'archived'] as const

interface TaskDetailEditorProps {
    task: Task
}

export default function TaskDetailEditor({ task }: TaskDetailEditorProps) {
    const [draft, setDraft] = useState<Task>(task)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const updateDraft = (field: keyof Task, value: Task[keyof Task]) => {
        setDraft((prev) => ({ ...prev, [field]: value }))
    }

    const save = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...draft,
                    required_tools_tags: Array.isArray(draft.required_tools_tags)
                        ? draft.required_tools_tags.join(', ')
                        : draft.required_tools_tags,
                    skills_tags: Array.isArray(draft.skills_tags)
                        ? draft.skills_tags.join(', ')
                        : draft.skills_tags,
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to update task')
            }
            setDraft(data.task)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to update task')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                        value={draft.title}
                        onChange={(e) => updateDraft('title', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                        value={draft.status}
                        onChange={(e) => updateDraft('status', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Game</label>
                    <input
                        value={draft.game || ''}
                        onChange={(e) => updateDraft('game', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">MFG</label>
                    <input
                        value={draft.mfg || ''}
                        onChange={(e) => updateDraft('mfg', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Min Minutes</label>
                    <input
                        type="number"
                        value={draft.estimated_minutes_min ?? ''}
                        onChange={(e) =>
                            updateDraft(
                                'estimated_minutes_min',
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Max Minutes</label>
                    <input
                        type="number"
                        value={draft.estimated_minutes_max ?? ''}
                        onChange={(e) =>
                            updateDraft(
                                'estimated_minutes_max',
                                e.target.value ? Number(e.target.value) : null
                            )
                        }
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Priority (1-5)</label>
                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={draft.priority}
                        onChange={(e) => updateDraft('priority', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Required Tools Tags</label>
                    <input
                        value={
                            Array.isArray(draft.required_tools_tags)
                                ? draft.required_tools_tags.join(', ')
                                : typeof draft.required_tools_tags === 'string'
                                    ? draft.required_tools_tags
                                    : ''
                        }
                        onChange={(e) => updateDraft('required_tools_tags', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Skills Tags</label>
                    <input
                        value={
                            Array.isArray(draft.skills_tags)
                                ? draft.skills_tags.join(', ')
                                : typeof draft.skills_tags === 'string'
                                    ? draft.skills_tags
                                    : ''
                        }
                        onChange={(e) => updateDraft('skills_tags', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={save}
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                    onClick={() => router.push('/tasks')}
                    className="text-sm text-[var(--color-secondary)] hover:underline"
                >
                    Back to Tasks
                </button>
            </div>
        </div>
    )
}
