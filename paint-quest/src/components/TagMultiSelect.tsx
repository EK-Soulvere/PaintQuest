'use client'

import { useMemo } from 'react'

interface TagMultiSelectProps {
    label: string
    options: string[]
    value: string[]
    onChange: (next: string[]) => void
    placeholder?: string
}

export default function TagMultiSelect({
    label,
    options,
    value,
    onChange,
    placeholder,
}: TagMultiSelectProps) {
    const normalized = useMemo(() => value.map((tag) => tag.toLowerCase()), [value])

    const toggleOption = (tag: string) => {
        if (normalized.includes(tag.toLowerCase())) {
            onChange(value.filter((v) => v.toLowerCase() !== tag.toLowerCase()))
        } else {
            onChange([...value, tag])
        }
    }

    const removeTag = (tag: string) => {
        onChange(value.filter((v) => v.toLowerCase() !== tag.toLowerCase()))
    }

    return (
        <div className="space-y-2">
            <label className="block text-xs text-[var(--color-text)] opacity-70">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {value.length === 0 ? (
                    <span className="text-xs text-[var(--color-text)] opacity-50">
                        None selected
                    </span>
                ) : (
                    value.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="px-2 py-1 text-xs rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                            title="Remove"
                        >
                            {tag} x
                        </button>
                    ))
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const selected = normalized.includes(option.toLowerCase())
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => toggleOption(option)}
                            className={`px-2 py-1 text-xs rounded-full border ${
                                selected
                                    ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)]'
                                    : 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]'
                            }`}
                        >
                            {option}
                        </button>
                    )
                })}
            </div>

            {/* Custom tag add temporarily disabled: {placeholder} */}
        </div>
    )
}
