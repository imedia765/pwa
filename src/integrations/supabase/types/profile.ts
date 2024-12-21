export type Profile = {
  Row: {
    created_at: string
    email: string | null
    id: string
    role: "member" | "collector" | "admin" | null
    updated_at: string
    user_id: string | null
    profile_completed?: boolean | null
  }
  Insert: {
    created_at?: string
    email?: string | null
    id?: string
    role?: "member" | "collector" | "admin" | null
    updated_at?: string
    user_id?: string | null
    profile_completed?: boolean | null
  }
  Update: {
    created_at?: string
    email?: string | null
    id?: string
    role?: "member" | "collector" | "admin" | null
    updated_at?: string
    user_id?: string | null
    profile_completed?: boolean | null
  }
  Relationships: []
}