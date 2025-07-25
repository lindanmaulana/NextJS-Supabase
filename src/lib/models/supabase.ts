import { PostgrestError } from "@supabase/supabase-js"

export interface SupabaseResponse<T> {
    data: T | null
    count: number | null
    error: PostgrestError | null
    status:number
    statusText: string
}

export interface ParamsRequest {
    id: string
}