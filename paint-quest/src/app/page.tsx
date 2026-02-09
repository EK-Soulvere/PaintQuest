import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
            <Link
              href="/sessions"
              className="inline-block px-8 py-4 bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold rounded-md hover:opacity-90 transition-opacity"
            >
              Go to Sessions
            </Link>
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
