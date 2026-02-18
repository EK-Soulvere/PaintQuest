import { redirect } from 'next/navigation'

export default async function TaskDetailLegacyPage({
    params,
}: {
    params: Promise<{ taskId: string }>
}) {
    const { taskId } = await params
    redirect(`/quests/${taskId}`)
}
