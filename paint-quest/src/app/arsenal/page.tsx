import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ArsenalList from './ArsenalList'

export default async function ArsenalPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: items } = await supabase
        .from('arsenal_item')
        .select('*')
        .order('updated_at', { ascending: false })

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                        Arsenal
                    </h1>
                    <p className="text-[var(--color-text)] opacity-70">
                        Track tools, paints, and brushes available to you.
                    </p>
                </div>
                <ArsenalList initialItems={items || []} />
            </div>
        </div>
    )
}
