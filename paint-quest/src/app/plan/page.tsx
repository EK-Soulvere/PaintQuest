import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanPanel from './PlanPanel'

export default async function PlanPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: profile } = await supabase
        .from('profile')
        .select('default_time_bucket')
        .maybeSingle()

    const defaultBucket = profile?.default_time_bucket ?? 30

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                        Quick Start
                    </h1>
                    <p className="text-[var(--color-text)] opacity-70">
                        Choose a time bucket and get 5 recommended tasks.
                    </p>
                </div>
                <PlanPanel defaultMinutes={defaultBucket} />
            </div>
        </div>
    )
}
