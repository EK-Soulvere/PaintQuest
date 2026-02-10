import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profile']['Row']

export async function getProfile(): Promise<Profile | null> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) throw new Error('Failed to load profile')
    return data ?? null
}

export async function upsertProfile(profile: Database['public']['Tables']['profile']['Insert']) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
        .from('profile')
        .upsert([{ ...profile, user_id: user.id }], { onConflict: 'user_id' })
        .select()
        .single()

    if (error || !data) throw new Error('Failed to save profile')
    return data
}
