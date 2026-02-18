import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TasksList from '../tasks/TasksList'

export default async function QuestsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: tasks, error } = await supabase
        .from('task')
        .select('*')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching quests:', error)
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                            Quests
                        </h1>
                        <p className="text-[var(--color-text)] opacity-70">
                            Build your quest backlog. Each quest can have multiple attempts.
                        </p>
                    </div>
                </div>

                <TasksList initialTasks={tasks || []} />
            </div>
        </div>
    )
}
