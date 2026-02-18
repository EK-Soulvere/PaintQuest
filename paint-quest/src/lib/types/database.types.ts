export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            attempt: {
                Row: {
                    id: string
                    user_id: string
                    task_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    task_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    task_id?: string | null
                    created_at?: string
                }
            }
            progress_event: {
                Row: {
                    event_id: string
                    timestamp: string
                    attempt_id: string
                    event_type: string
                    payload: Json | null
                }
                Insert: {
                    event_id?: string
                    timestamp?: string
                    attempt_id: string
                    event_type: string
                    payload?: Json | null
                }
                Update: {
                    event_id?: string
                    timestamp?: string
                    attempt_id?: string
                    event_type?: string
                    payload?: Json | null
                }
            }
            attempt_entry: {
                Row: {
                    entry_id: string
                    attempt_id: string
                    user_id: string
                    entry_type: string
                    content: Json
                    created_at: string
                }
                Insert: {
                    entry_id?: string
                    attempt_id: string
                    user_id: string
                    entry_type: string
                    content: Json
                    created_at?: string
                }
                Update: {
                    entry_id?: string
                    attempt_id?: string
                    user_id?: string
                    entry_type?: string
                    content?: Json
                    created_at?: string
                }
            }
            task: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    game: string | null
                    mfg: string | null
                    estimated_minutes_min: number | null
                    estimated_minutes_max: number | null
                    priority: number
                    required_tools_tags: Json | null
                    skills_tags: Json | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    game?: string | null
                    mfg?: string | null
                    estimated_minutes_min?: number | null
                    estimated_minutes_max?: number | null
                    priority?: number
                    required_tools_tags?: Json | null
                    skills_tags?: Json | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    game?: string | null
                    mfg?: string | null
                    estimated_minutes_min?: number | null
                    estimated_minutes_max?: number | null
                    priority?: number
                    required_tools_tags?: Json | null
                    skills_tags?: Json | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            recommendation_config: {
                Row: {
                    id: string
                    user_id: string
                    weight_priority: number
                    weight_time_fit: number
                    weight_skill_match: number
                    weight_stale: number
                    weight_recency_penalty: number
                    stale_days_threshold: number
                    recent_days_threshold: number
                    focus_skills: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    weight_priority?: number
                    weight_time_fit?: number
                    weight_skill_match?: number
                    weight_stale?: number
                    weight_recency_penalty?: number
                    stale_days_threshold?: number
                    recent_days_threshold?: number
                    focus_skills?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    weight_priority?: number
                    weight_time_fit?: number
                    weight_skill_match?: number
                    weight_stale?: number
                    weight_recency_penalty?: number
                    stale_days_threshold?: number
                    recent_days_threshold?: number
                    focus_skills?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            profile: {
                Row: {
                    id: string
                    user_id: string
                    media: Json | null
                    focus_skills_top3: Json | null
                    focus_skills_bottom3: Json | null
                    default_time_bucket: number | null
                    constraints: Json | null
                    energy_preference: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    media?: Json | null
                    focus_skills_top3?: Json | null
                    focus_skills_bottom3?: Json | null
                    default_time_bucket?: number | null
                    constraints?: Json | null
                    energy_preference?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    media?: Json | null
                    focus_skills_top3?: Json | null
                    focus_skills_bottom3?: Json | null
                    default_time_bucket?: number | null
                    constraints?: Json | null
                    energy_preference?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            arsenal_item: {
                Row: {
                    id: string
                    user_id: string
                    category: string
                    name: string
                    tags: Json | null
                    available: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category: string
                    name: string
                    tags?: Json | null
                    available?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category?: string
                    name?: string
                    tags?: Json | null
                    available?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            quest_attempt_template: {
                Row: {
                    id: string
                    user_id: string
                    task_id: string | null
                    title: string
                    description: string | null
                    estimated_minutes_min: number
                    estimated_minutes_max: number
                    energy: 'low' | 'med' | 'high'
                    required_tools_tags: Json | null
                    focus_skills_tags: Json | null
                    progress_value: string | null
                    is_system_generated: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    task_id?: string | null
                    title: string
                    description?: string | null
                    estimated_minutes_min: number
                    estimated_minutes_max: number
                    energy: 'low' | 'med' | 'high'
                    required_tools_tags?: Json | null
                    focus_skills_tags?: Json | null
                    progress_value?: string | null
                    is_system_generated?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    task_id?: string | null
                    title?: string
                    description?: string | null
                    estimated_minutes_min?: number
                    estimated_minutes_max?: number
                    energy?: 'low' | 'med' | 'high'
                    required_tools_tags?: Json | null
                    focus_skills_tags?: Json | null
                    progress_value?: string | null
                    is_system_generated?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
