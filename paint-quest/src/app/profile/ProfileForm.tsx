'use client'

import { useState } from 'react'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profile']['Row']

const energyOptions = ['low', 'med', 'high']
const timeBuckets = [15, 30, 45, 60, 90, 120]

interface ProfileFormProps {
    initialProfile: Profile | null
}

function parseList(value: string): string[] | null {
    const parts = value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    return parts.length > 0 ? parts : null
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
    const [media, setMedia] = useState(
        Array.isArray(initialProfile?.media) ? initialProfile?.media.join(', ') : ''
    )
    const [focusTop, setFocusTop] = useState(
        Array.isArray(initialProfile?.focus_skills_top3)
            ? initialProfile?.focus_skills_top3.join(', ')
            : ''
    )
    const [focusBottom, setFocusBottom] = useState(
        Array.isArray(initialProfile?.focus_skills_bottom3)
            ? initialProfile?.focus_skills_bottom3.join(', ')
            : ''
    )
    const [defaultTime, setDefaultTime] = useState(
        initialProfile?.default_time_bucket ?? 30
    )
    const [excludedTools, setExcludedTools] = useState(
        initialProfile?.constraints &&
            typeof initialProfile.constraints === 'object' &&
            !Array.isArray(initialProfile.constraints)
            ? ((initialProfile.constraints as { excluded_tools_tags?: string[] })
                  .excluded_tools_tags || []
              ).join(', ')
            : ''
    )
    const [energy, setEnergy] = useState(initialProfile?.energy_preference ?? 'med')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    const save = async () => {
        setSaving(true)
        setError(null)
        setSaved(false)
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media: parseList(media),
                    focus_skills_top3: parseList(focusTop),
                    focus_skills_bottom3: parseList(focusBottom),
                    default_time_bucket: defaultTime,
                    constraints: {
                        excluded_tools_tags: parseList(excludedTools),
                    },
                    energy_preference: energy,
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to save profile')
            }
            setSaved(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                        Media (comma separated)
                    </label>
                    <input
                        value={media}
                        onChange={(e) => setMedia(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="acrylic, oil, digital"
                    />
                </div>
                <div>
                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                        Default Time Bucket
                    </label>
                    <select
                        value={defaultTime}
                        onChange={(e) => setDefaultTime(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    >
                        {timeBuckets.map((bucket) => (
                            <option key={bucket} value={bucket}>
                                {bucket} min
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                        Focus Skills (Top 3)
                    </label>
                    <input
                        value={focusTop}
                        onChange={(e) => setFocusTop(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="blending, glaze, edge highlight"
                    />
                </div>
                <div>
                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                        Focus Skills (Bottom 3)
                    </label>
                    <input
                        value={focusBottom}
                        onChange={(e) => setFocusBottom(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="airbrush, basing, freehand"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                        Excluded Tools (constraints)
                    </label>
                    <input
                        value={excludedTools}
                        onChange={(e) => setExcludedTools(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                        placeholder="airbrush, spray booth"
                    />
                </div>
                <div>
                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                        Energy Preference
                    </label>
                    <select
                        value={energy}
                        onChange={(e) => setEnergy(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                    >
                        {energyOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error ? (
                <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded-md bg-red-500/10">
                    {error}
                </div>
            ) : null}
            {saved ? (
                <div className="p-2 text-sm text-[var(--color-tertiary)] border border-[var(--color-tertiary)]/40 rounded-md">
                    Profile saved
                </div>
            ) : null}

            <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>
    )
}
