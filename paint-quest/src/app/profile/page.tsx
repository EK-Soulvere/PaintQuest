import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: profile } = await supabase
        .from('profile')
        .select('*')
        .maybeSingle()

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                        Profile
                    </h1>
                    <p className="text-[var(--color-text)] opacity-70">
                        Set your focus skills, constraints, and preferences.
                    </p>
                </div>
                <ProfileForm initialProfile={profile} />
            </div>
        </div>
    )
}
