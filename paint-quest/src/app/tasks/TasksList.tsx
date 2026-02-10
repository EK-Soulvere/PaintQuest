'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'

type Task = Database['public']['Tables']['task']['Row']

const statusOptions = ['backlog', 'active', 'done', 'someday', 'archived'] as const

interface TasksListProps {
    initialTasks: Task[]
}

export default function TasksList({ initialTasks }: TasksListProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [creating, setCreating] = useState(false)
    const router = useRouter()

    const createEmptyTask = async () => {
        setCreating(true)
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'New task',
                    priority: 3,
                    status: 'backlog',
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to create task')
            }

            setTasks([data.task, ...tasks])
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to create task')
        } finally {
            setCreating(false)
        }
    }

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.error || 'Failed to update task')
        }
        return data.task as Task
    }

    const handleFieldChange = async (
        taskId: string,
        field: keyof Task,
        value: Task[keyof Task]
    ) => {
        try {
            const updated = await updateTask(taskId, { [field]: value } as Partial<Task>)
            setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)))
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to update task')
        }
    }

    const archiveTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to archive task')
            }
            setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)))
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to archive task')
        }
    }

    return (
        <div className="space-y-6">
            <button
                onClick={createEmptyTask}
                disabled={creating}
                className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {creating ? 'Creating...' : '+ New Task'}
            </button>

            {tasks.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <p className="text-[var(--color-text)] opacity-70">
                        No tasks yet. Create your first one!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <input
                                    value={task.title}
                                    onChange={(e) => handleFieldChange(task.id, 'title', e.target.value)}
                                    className="w-full md:flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                />
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--color-text)] opacity-70">Status</label>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleFieldChange(task.id, 'status', e.target.value)}
                                        className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
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
                                <input
                                    value={task.game || ''}
                                    onChange={(e) => handleFieldChange(task.id, 'game', e.target.value)}
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="Game (optional)"
                                />
                                <input
                                    value={task.mfg || ''}
                                    onChange={(e) => handleFieldChange(task.id, 'mfg', e.target.value)}
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="MFG (optional)"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <input
                                    type="number"
                                    value={task.estimated_minutes_min ?? ''}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            task.id,
                                            'estimated_minutes_min',
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="Min minutes"
                                />
                                <input
                                    type="number"
                                    value={task.estimated_minutes_max ?? ''}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            task.id,
                                            'estimated_minutes_max',
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="Max minutes"
                                />
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={task.priority}
                                    onChange={(e) =>
                                        handleFieldChange(task.id, 'priority', Number(e.target.value))
                                    }
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="Priority"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    value={Array.isArray(task.required_tools_tags) ? task.required_tools_tags.join(', ') : ''}
                                    onChange={(e) =>
                                        handleFieldChange(task.id, 'required_tools_tags', e.target.value)
                                    }
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="Required tools tags (comma separated)"
                                />
                                <input
                                    value={Array.isArray(task.skills_tags) ? task.skills_tags.join(', ') : ''}
                                    onChange={(e) =>
                                        handleFieldChange(task.id, 'skills_tags', e.target.value)
                                    }
                                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    placeholder="Skills tags (comma separated)"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => archiveTask(task.id)}
                                    className="text-sm text-red-400 hover:underline"
                                >
                                    Archive
                                </button>
                                <button
                                    onClick={() => router.push(`/tasks/${task.id}`)}
                                    className="text-sm text-[var(--color-secondary)] hover:underline"
                                >
                                    Open task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
