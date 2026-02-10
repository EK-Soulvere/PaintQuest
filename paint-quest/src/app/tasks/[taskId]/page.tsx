import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TaskDetailEditor from './TaskDetailEditor'
import StartQuestButton from './StartQuestButton'

export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ taskId: string }>
}) {
    const { taskId } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: task, error } = await supabase
        .from('task')
        .select('*')
        .eq('id', taskId)
        .single()

    if (error || !task) {
        notFound()
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                            Task Detail
                        </h1>
                        <p className="text-[var(--color-text)] opacity-70">
                            Edit your task inline and start a quest.
                        </p>
                    </div>
                    <StartQuestButton taskId={task.id} />
                </div>

                <TaskDetailEditor task={task} />
            </div>
        </div>
    )
}
