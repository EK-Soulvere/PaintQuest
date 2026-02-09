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
        }
    }
}
