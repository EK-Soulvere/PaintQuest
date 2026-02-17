'use client'

import { useState } from 'react'
import type { Database } from '@/lib/types/database.types'
import { TOOL_TAGS, PAINT_BRAND_TAGS, PAINT_MEDIUM_TAGS } from '@/lib/constants/tags'
import TagMultiSelect from '@/components/TagMultiSelect'

type ArsenalItem = Database['public']['Tables']['arsenal_item']['Row']

const categories = ['paint', 'tool', 'other'] as const

interface ArsenalListProps {
    initialItems: ArsenalItem[]
}

export default function ArsenalList({ initialItems }: ArsenalListProps) {
    const [items, setItems] = useState<ArsenalItem[]>(initialItems)
    const [creating, setCreating] = useState(false)
    const [uploading, setUploading] = useState(false)

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

    const parseCsvRows = (text: string) => {
        const lines = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
        if (lines.length < 2) return []

        const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
        const colorIndex = headers.findIndex((h) => h === 'color' || h === 'name')
        const brandIndex = headers.findIndex((h) => h === 'brand')
        const mediumIndex = headers.findIndex((h) => h === 'medium')
        const availableIndex = headers.findIndex((h) => h === 'available')

        if (colorIndex < 0) {
            throw new Error('CSV must include a color column')
        }

        return lines.slice(1).map((line) => {
            const cols = line.split(',').map((col) => col.trim())
            return {
                color: cols[colorIndex] || '',
                brand: brandIndex >= 0 ? cols[brandIndex] || null : null,
                medium: mediumIndex >= 0 ? cols[mediumIndex] || null : null,
                available:
                    availableIndex >= 0
                        ? !['false', '0', 'no'].includes((cols[availableIndex] || '').toLowerCase())
                        : true,
            }
        })
    }

    const handleBulkUpload = async (file: File | null) => {
        if (!file) return
        setUploading(true)
        try {
            const text = await file.text()
            const rows = parseCsvRows(text)
            const response = await fetch('/api/arsenal/bulk-paint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error || 'Bulk upload failed')
            }
            setItems((prev) => [...data.items, ...prev])
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : 'Bulk upload failed')
        } finally {
            setUploading(false)
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
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-2">
                <p className="text-sm text-[var(--color-text)] opacity-80">
                    Bulk Upload Paint CSV
                </p>
                <p className="text-xs text-[var(--color-text)] opacity-60">
                    Headers: `color,brand,medium,available`
                </p>
                <input
                    type="file"
                    accept=".csv,text/csv"
                    disabled={uploading}
                    onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        void handleBulkUpload(file)
                        e.currentTarget.value = ''
                    }}
                    className="text-sm"
                />
                {uploading ? (
                    <p className="text-xs text-[var(--color-text)] opacity-60">Uploading...</p>
                ) : null}
            </div>

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
                                        {item.category === 'paint' ? 'Color' : 'Name'}
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
                            {item.category === 'tool' ? (
                                <TagMultiSelect
                                    label="Tool Tags"
                                    options={TOOL_TAGS as unknown as string[]}
                                    value={Array.isArray(item.tags) ? item.tags.map(String) : []}
                                    onChange={(next) => {
                                        handleFieldChange(item.id, 'tags', next)
                                        handleFieldBlur(item.id, 'tags', next)
                                    }}
                                />
                            ) : null}

                            {item.category === 'paint' ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <TagMultiSelect
                                        label="Paint Brand Tags"
                                        options={PAINT_BRAND_TAGS as unknown as string[]}
                                        value={Array.isArray(item.tags) ? item.tags.map(String) : []}
                                        onChange={(next) => {
                                            handleFieldChange(item.id, 'tags', next)
                                            handleFieldBlur(item.id, 'tags', next)
                                        }}
                                    />
                                    <TagMultiSelect
                                        label="Paint Medium"
                                        options={PAINT_MEDIUM_TAGS as unknown as string[]}
                                        value={Array.isArray(item.tags) ? item.tags.map(String) : []}
                                        onChange={(next) => {
                                            handleFieldChange(item.id, 'tags', next)
                                            handleFieldBlur(item.id, 'tags', next)
                                        }}
                                    />
                                </div>
                            ) : null}

                            {item.category === 'other' ? (
                                <div>
                                    <label className="block text-xs text-[var(--color-text)] opacity-70 mb-1">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        value={Array.isArray(item.tags) ? item.tags.join(', ') : ''}
                                        onChange={(e) => handleFieldChange(item.id, 'tags', e.target.value)}
                                        onBlur={(e) => handleFieldBlur(item.id, 'tags', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md"
                                        placeholder="Add tags (comma separated)"
                                    />
                                </div>
                            ) : null}
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
