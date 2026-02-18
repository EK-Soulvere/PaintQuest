'use client'

import { useState } from 'react'
import type { Database } from '@/lib/types/database.types'
import TagMultiSelect from '@/components/TagMultiSelect'
import { TOOL_TAGS, PROFILE_FOCUS_SKILLS } from '@/lib/constants/tags'

type Template = Database['public']['Tables']['quest_attempt_template']['Row']

interface AttemptTemplatesEditorProps {
    taskId: string
    initialTemplates: Template[]
}

const energyOptions: Array<'low' | 'med' | 'high'> = ['low', 'med', 'high']

interface TemplateDraft {
    title: string
    description: string
    estimated_minutes_min: number
    estimated_minutes_max: number
    energy: 'low' | 'med' | 'high'
    required_tools_tags: string[]
    focus_skills_tags: string[]
    progress_value: string
}

const blankDraft: TemplateDraft = {
    title: '',
    description: '',
    estimated_minutes_min: 20,
    estimated_minutes_max: 45,
    energy: 'med',
    required_tools_tags: [],
    focus_skills_tags: [],
    progress_value: '',
}

export default function AttemptTemplatesEditor({
    taskId,
    initialTemplates,
}: AttemptTemplatesEditorProps) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates)
    const [newDraft, setNewDraft] = useState<TemplateDraft>(blankDraft)
    const [savingNew, setSavingNew] = useState(false)
    const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
    const [error, setError] = useState<string | null>(null)

    const updateTemplate = async (id: string, updates: Partial<Template>) => {
        const response = await fetch(`/api/quests/${taskId}/attempt-templates/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Failed to update template')
        return data.template as Template
    }

    const deleteTemplate = async (id: string) => {
        const response = await fetch(`/api/quests/${taskId}/attempt-templates/${id}`, {
            method: 'DELETE',
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Failed to delete template')
    }

    const saveNew = async () => {
        setSavingNew(true)
        setError(null)
        try {
            const response = await fetch(`/api/quests/${taskId}/attempt-templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDraft),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data?.error || 'Failed to create template')
            setTemplates([data.template, ...templates])
            setNewDraft(blankDraft)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setSavingNew(false)
        }
    }

    return (
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
                    Attempt Templates
                </h2>
                <p className="text-sm text-[var(--color-text)] opacity-70">
                    Create reusable suggested attempts for this quest.
                </p>
            </div>

            {error ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}

            <div className="p-4 border border-[var(--color-border)] rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-[var(--color-secondary)]">New Template</h3>
                <div className="grid md:grid-cols-2 gap-3">
                    <input
                        value={newDraft.title}
                        onChange={(e) => setNewDraft((d) => ({ ...d, title: e.target.value }))}
                        className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="Title"
                    />
                    <input
                        value={newDraft.progress_value}
                        onChange={(e) => setNewDraft((d) => ({ ...d, progress_value: e.target.value }))}
                        className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="Progress promise"
                    />
                </div>
                <textarea
                    value={newDraft.description}
                    onChange={(e) => setNewDraft((d) => ({ ...d, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    placeholder="Description"
                />
                <div className="grid md:grid-cols-3 gap-3">
                    <input
                        type="number"
                        value={newDraft.estimated_minutes_min}
                        onChange={(e) =>
                            setNewDraft((d) => ({
                                ...d,
                                estimated_minutes_min: Number(e.target.value),
                            }))
                        }
                        className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="Min minutes"
                    />
                    <input
                        type="number"
                        value={newDraft.estimated_minutes_max}
                        onChange={(e) =>
                            setNewDraft((d) => ({
                                ...d,
                                estimated_minutes_max: Number(e.target.value),
                            }))
                        }
                        className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="Max minutes"
                    />
                    <select
                        value={newDraft.energy}
                        onChange={(e) =>
                            setNewDraft((d) => ({
                                ...d,
                                energy: e.target.value as 'low' | 'med' | 'high',
                            }))
                        }
                        className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    >
                        {energyOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <TagMultiSelect
                        label="Required Tools"
                        options={TOOL_TAGS as unknown as string[]}
                        value={newDraft.required_tools_tags}
                        onChange={(next) => setNewDraft((d) => ({ ...d, required_tools_tags: next }))}
                    />
                    <TagMultiSelect
                        label="Focus Skills"
                        options={PROFILE_FOCUS_SKILLS as unknown as string[]}
                        value={newDraft.focus_skills_tags}
                        onChange={(next) => setNewDraft((d) => ({ ...d, focus_skills_tags: next }))}
                    />
                </div>
                <button
                    onClick={saveNew}
                    disabled={savingNew || !newDraft.title.trim()}
                    className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] rounded-md font-semibold disabled:opacity-50"
                >
                    {savingNew ? 'Saving...' : 'Add Template'}
                </button>
            </div>

            <div className="space-y-4">
                {templates.length === 0 ? (
                    <p className="text-sm text-[var(--color-text)] opacity-70">
                        No templates yet for this quest.
                    </p>
                ) : (
                    templates.map((template) => (
                        <EditableTemplateCard
                            key={template.id}
                            taskId={taskId}
                            template={template}
                            saving={Boolean(savingIds[template.id])}
                            onSavingChange={(isSaving) =>
                                setSavingIds((prev) => ({ ...prev, [template.id]: isSaving }))
                            }
                            onUpdated={(updated) =>
                                setTemplates((prev) =>
                                    prev.map((t) => (t.id === updated.id ? updated : t))
                                )
                            }
                            onDeleted={async () => {
                                await deleteTemplate(template.id)
                                setTemplates((prev) => prev.filter((t) => t.id !== template.id))
                            }}
                            updateTemplate={updateTemplate}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function EditableTemplateCard(props: {
    taskId: string
    template: Template
    saving: boolean
    onSavingChange: (saving: boolean) => void
    onUpdated: (template: Template) => void
    onDeleted: () => Promise<void>
    updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template>
}) {
    const { template, saving, onSavingChange, onUpdated, onDeleted, updateTemplate } = props
    const [draft, setDraft] = useState(template)
    const [localError, setLocalError] = useState<string | null>(null)

    const save = async () => {
        onSavingChange(true)
        setLocalError(null)
        try {
            const updated = await updateTemplate(template.id, {
                title: draft.title,
                description: draft.description,
                estimated_minutes_min: draft.estimated_minutes_min,
                estimated_minutes_max: draft.estimated_minutes_max,
                energy: draft.energy,
                required_tools_tags: Array.isArray(draft.required_tools_tags)
                    ? draft.required_tools_tags
                    : [],
                focus_skills_tags: Array.isArray(draft.focus_skills_tags)
                    ? draft.focus_skills_tags
                    : [],
                progress_value: draft.progress_value,
            })
            setDraft(updated)
            onUpdated(updated)
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            onSavingChange(false)
        }
    }

    return (
        <div className="p-4 border border-[var(--color-border)] rounded-lg space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
                <input
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                />
                <input
                    value={draft.progress_value || ''}
                    onChange={(e) =>
                        setDraft((d) => ({ ...d, progress_value: e.target.value || null }))
                    }
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                />
            </div>
            <textarea
                value={draft.description || ''}
                onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value || null }))
                }
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
            />
            <div className="grid md:grid-cols-3 gap-3">
                <input
                    type="number"
                    value={draft.estimated_minutes_min}
                    onChange={(e) =>
                        setDraft((d) => ({ ...d, estimated_minutes_min: Number(e.target.value) }))
                    }
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                />
                <input
                    type="number"
                    value={draft.estimated_minutes_max}
                    onChange={(e) =>
                        setDraft((d) => ({ ...d, estimated_minutes_max: Number(e.target.value) }))
                    }
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                />
                <select
                    value={draft.energy}
                    onChange={(e) =>
                        setDraft((d) => ({
                            ...d,
                            energy: e.target.value as 'low' | 'med' | 'high',
                        }))
                    }
                    className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                >
                    {energyOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                <TagMultiSelect
                    label="Required Tools"
                    options={TOOL_TAGS as unknown as string[]}
                    value={Array.isArray(draft.required_tools_tags) ? draft.required_tools_tags.map(String) : []}
                    onChange={(next) =>
                        setDraft((d) => ({ ...d, required_tools_tags: next }))
                    }
                />
                <TagMultiSelect
                    label="Focus Skills"
                    options={PROFILE_FOCUS_SKILLS as unknown as string[]}
                    value={Array.isArray(draft.focus_skills_tags) ? draft.focus_skills_tags.map(String) : []}
                    onChange={(next) =>
                        setDraft((d) => ({ ...d, focus_skills_tags: next }))
                    }
                />
            </div>
            {localError ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {localError}
                </div>
            ) : null}
            <div className="flex items-center gap-3">
                <button
                    onClick={save}
                    disabled={saving}
                    className="px-3 py-1 text-sm bg-[var(--color-primary)] text-[var(--color-bg)] rounded-md disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                    onClick={onDeleted}
                    disabled={saving}
                    className="px-3 py-1 text-sm border border-red-500/60 text-red-400 rounded-md disabled:opacity-50"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}
