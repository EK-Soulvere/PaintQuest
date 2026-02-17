import { createClient } from '@/lib/supabase/server'
import { getActiveAttemptForUser } from '@/lib/attempts/server'
import PlanPanel from './plan/PlanPanel'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const active = await getActiveAttemptForUser()
    if (active?.attempt) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl text-center space-y-4">
            <h1 className="text-4xl font-bold text-[var(--color-primary)]">
              Active Quest
            </h1>
            <p className="text-[var(--color-text)] opacity-70">
              You have an active quest in progress.
            </p>
            <Link
              href={`/sessions/${active.attempt.id}`}
              className="inline-block px-8 py-4 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity"
            >
              Go to Active Quest
            </Link>
          </div>
        </div>
      )
    }
  }

  let defaultBucket = 30
  if (user) {
    const { data: profile } = await supabase
      .from('profile')
      .select('default_time_bucket')
      .maybeSingle()
    if (profile?.default_time_bucket) {
      defaultBucket = profile.default_time_bucket
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold mb-4 text-[var(--color-primary)]">
          PaintQuest
        </h1>
        <p className="text-xl text-[var(--color-text)] opacity-80 mb-8">
          Session-friendly painting progress workflow tool
        </p>
        <p className="text-lg text-[var(--color-text)] opacity-60 mb-12 max-w-lg mx-auto">
          Track your painting sessions, record progress, and build a history of your creative journey.
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-[var(--color-secondary)] mb-4">
              Welcome back, {user.email}!
            </p>
            <div className="text-left">
              <PlanPanel defaultMinutes={defaultBucket} showStartButtons />
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/sessions"
                className="inline-block px-6 py-3 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity"
              >
                Go to Sessions
              </Link>
              <Link
                href="/tasks"
                className="inline-block px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-md hover:bg-[var(--color-surface)] transition-colors"
              >
                Manage Quests
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth"
              className="px-8 py-4 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
