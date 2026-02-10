'use client'

import { useState } from 'react'
import type { Database } from '@/lib/types/database.types'

type ArsenalItem = Database['public']['Tables']['arsenal_item']['Row']

const categories = ['paint', 'tool', 'brush', 'other'] as const

interface ArsenalListProps {
    initialItems: ArsenalItem[]
}

export default function ArsenalList({ initialItems }: ArsenalListProps) {
    const [items, setItems] = useState<ArsenalItem[]>(initialItems)
    const [creating, setCreating] = useState(false)

    const createItem = async () => {
        setCreating(true)
        try {
            const response = await fetch('/api/arsenal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'tool',
                    name: 'New item',
                    tags: [],
                    available: true,
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to create item')
            }
            setItems([data.item, ...items])
        } catch (error) {
            console.error(error)
            alert('Failed to create item')
        } finally {
            setCreating(false)
        }
    }

    const updateItem = async (id: string, updates: Partial<ArsenalItem>) => {
        const response = await fetch(`/api/arsenal/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.error || 'Failed to update item')
        }
        return data.item as ArsenalItem
    }

    const handleFieldChange = (id: string, field: keyof ArsenalItem, value: ArsenalItem[keyof ArsenalItem]) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    }

    const handleFieldBlur = async (id: string, field: keyof ArsenalItem, value: ArsenalItem[keyof ArsenalItem]) => {
        try {
            const updated = await updateItem(id, { [field]: value } as Partial<ArsenalItem>)
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
        } catch (error) {
            console.error(error)
            alert('Failed to update item')
        }
    }

    const deleteItem = async (id: string) => {
        try {
            const response = await fetch(`/api/arsenal/${id}`, { method: 'DELETE' })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to delete item')
            }
            setItems((prev) => prev.filter((item) => item.id !== id))
        } catch (error) {
            console.error(error)
            alert('Failed to delete item')
        }
    }

    return (
        <div className="space-y-6">
            <button
                onClick={createItem}
                disabled={creating}
                className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {creating ? 'Creating...' : '+ New Item'}
            </button>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                    <p className="text-[var(--color-text)] opacity-70">
                        No items yet. Add your first tool or paint.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4"
                        >
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Name
                                    </label>
                                    <input
                                        value={item.name}
                                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                                        onBlur={(e) => handleFieldBlur(item.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={item.category}
                                        onChange={(e) => {
                                            handleFieldChange(item.id, 'category', e.target.value)
                                            handleFieldBlur(item.id, 'category', e.target.value)
                                        }}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    >
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Available
                                    </label>
                                    <select
                                        value={item.available ? 'yes' : 'no'}
                                        onChange={(e) => {
                                            const value = e.target.value === 'yes'
                                            handleFieldChange(item.id, 'available', value)
                                            handleFieldBlur(item.id, 'available', value)
                                        }}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                    >
                                        <option value="yes">yes</option>
                                        <option value="no">no</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                    Tags (comma separated)
                                </label>
                                <input
                                    value={Array.isArray(item.tags) ? item.tags.join(', ') : ''}
                                    onChange={(e) => handleFieldChange(item.id, 'tags', e.target.value)}
                                    onBlur={(e) => handleFieldBlur(item.id, 'tags', e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                />
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="text-sm text-red-400 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
