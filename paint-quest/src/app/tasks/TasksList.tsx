'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'
import TagMultiSelect from '@/components/TagMultiSelect'
import { TOOL_TAGS, SKILL_TAGS } from '@/lib/constants/tags'

type Task = Database['public']['Tables']['task']['Row']

const statusOptions = ['backlog', 'active', 'done', 'someday', 'archived'] as const

interface TasksListProps {
    initialTasks: Task[]
}

export default function TasksList({ initialTasks }: TasksListProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [creating, setCreating] = useState(false)
    const [seeding, setSeeding] = useState(false)
    const router = useRouter()

    const normalizeTags = (value: Task['required_tools_tags']): string[] => {
        if (Array.isArray(value)) return value.map(String)
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((part) => part.trim())
                .filter(Boolean)
        }
        return []
    }

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

    const handleFieldChange = (
        taskId: string,
        field: keyof Task,
        value: Task[keyof Task]
    ) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? { ...task, [field]: value } : task))
        )
    }

    const handleFieldBlur = async (taskId: string, field: keyof Task, value: Task[keyof Task]) => {
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

    const seedDefaults = async () => {
        setSeeding(true)
        try {
            const response = await fetch('/api/tasks/seed', { method: 'POST' })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to seed tasks')
            }
            setTasks(data.tasks || [])
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to seed tasks')
        } finally {
            setSeeding(false)
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
                    <div className="mt-4 flex flex-col md:flex-row gap-3 justify-center">
                        <button
                            onClick={seedDefaults}
                            disabled={seeding}
                            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {seeding ? 'Generating...' : 'Generate 5 Starter Tasks'}
                        </button>
                        <button
                            onClick={createEmptyTask}
                            disabled={creating}
                            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-md hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create Empty Task'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {tasks.length > 0 ? (
                        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] opacity-80">
                            <p className="font-medium text-[var(--color-secondary)] mb-2">
                                Task Health
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <span>
                                    Missing time range:{' '}
                                    {
                                        tasks.filter(
                                            (task) =>
                                                task.estimated_minutes_min == null ||
                                                task.estimated_minutes_max == null
                                        ).length
                                    }
                                </span>
                                <span>
                                    Missing tags:{' '}
                                    {
                                        tasks.filter((task) => {
                                            const required = Array.isArray(task.required_tools_tags)
                                                ? task.required_tools_tags
                                                : []
                                            const skills = Array.isArray(task.skills_tags)
                                                ? task.skills_tags
                                                : []
                                            return required.length === 0 && skills.length === 0
                                        }).length
                                    }
                                </span>
                                <span>
                                    Low priority (<=2):{' '}
                                    {tasks.filter((task) => task.priority <= 2).length}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="w-full md:flex-1">
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Title
                                    </label>
                                    <input
                                        value={task.title}
                                        onChange={(e) => handleFieldChange(task.id, 'title', e.target.value)}
                                        onBlur={(e) => handleFieldBlur(task.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--color-text)] opacity-70">Status</label>
                                    <select
                                        value={task.status}
                                        onChange={(e) => {
                                            handleFieldChange(task.id, 'status', e.target.value)
                                            handleFieldBlur(task.id, 'status', e.target.value)
                                        }}
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
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Game
                                    </label>
                                    <input
                                        value={task.game || ''}
                                        onChange={(e) => handleFieldChange(task.id, 'game', e.target.value)}
                                        onBlur={(e) => handleFieldBlur(task.id, 'game', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                        placeholder="Game (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        MFG
                                    </label>
                                    <input
                                        value={task.mfg || ''}
                                        onChange={(e) => handleFieldChange(task.id, 'mfg', e.target.value)}
                                        onBlur={(e) => handleFieldBlur(task.id, 'mfg', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                        placeholder="MFG (optional)"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Min Minutes
                                    </label>
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
                                        onBlur={(e) =>
                                            handleFieldBlur(
                                                task.id,
                                                'estimated_minutes_min',
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                        placeholder="Min minutes"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Max Minutes
                                    </label>
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
                                        onBlur={(e) =>
                                            handleFieldBlur(
                                                task.id,
                                                'estimated_minutes_max',
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                        placeholder="Max minutes"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Priority (1-5)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={task.priority}
                                        onChange={(e) =>
                                            handleFieldChange(task.id, 'priority', Number(e.target.value))
                                        }
                                        onBlur={(e) =>
                                            handleFieldBlur(task.id, 'priority', Number(e.target.value))
                                        }
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                        placeholder="Priority"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <TagMultiSelect
                                    label="Required Tools Tags"
                                    options={TOOL_TAGS as unknown as string[]}
                                    value={normalizeTags(task.required_tools_tags)}
                                    onChange={(next) => {
                                        handleFieldChange(task.id, 'required_tools_tags', next)
                                        handleFieldBlur(task.id, 'required_tools_tags', next)
                                    }}
                                    placeholder="Add custom tool tag"
                                />
                                <TagMultiSelect
                                    label="Skills Tags"
                                    options={SKILL_TAGS as unknown as string[]}
                                    value={normalizeTags(task.skills_tags)}
                                    onChange={(next) => {
                                        handleFieldChange(task.id, 'skills_tags', next)
                                        handleFieldBlur(task.id, 'skills_tags', next)
                                    }}
                                    placeholder="Add custom skill tag"
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
                </div>
            )}
        </div>
    )
}
