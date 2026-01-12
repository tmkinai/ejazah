export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          full_name_arabic: string | null
          email: string
          phone_number: string | null
          date_of_birth: string | null
          gender: string | null
          country: string | null
          city: string | null
          avatar_url: string | null
          bio: string | null
          is_verified: boolean
          verification_level: string
          roles: string[]
          metadata: Json
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          full_name_arabic?: string | null
          email: string
          phone_number?: string | null
          date_of_birth?: string | null
          gender?: string | null
          country?: string | null
          city?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_verified?: boolean
          verification_level?: string
          roles?: string[]
          metadata?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          full_name_arabic?: string | null
          email?: string
          phone_number?: string | null
          date_of_birth?: string | null
          gender?: string | null
          country?: string | null
          city?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_verified?: boolean
          verification_level?: string
          roles?: string[]
          metadata?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scholars: {
        Row: {
          id: string
          specialization: string
          credentials: Json
          sanad_chain: Json
          is_active: boolean
          acceptance_rate: number | null
          total_ijazat_issued: number | null
          bio_detailed: string | null
          profile_visibility: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          specialization: string
          credentials: Json
          sanad_chain: Json
          is_active?: boolean
          acceptance_rate?: number | null
          total_ijazat_issued?: number | null
          bio_detailed?: string | null
          profile_visibility?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          specialization?: string
          credentials?: Json
          sanad_chain?: Json
          is_active?: boolean
          acceptance_rate?: number | null
          total_ijazat_issued?: number | null
          bio_detailed?: string | null
          profile_visibility?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholars_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ijazah_applications: {
        Row: {
          id: string
          user_id: string | null
          scholar_id: string | null
          application_number: string
          ijazah_type: string
          status: string
          personal_info: Json
          academic_background: Json
          quran_experience: Json
          prerequisites: Json | null
          documents: Json | null
          reviewer_notes: string | null
          interview_notes: string | null
          prerequisites_verified: boolean
          submitted_at: string | null
          reviewed_at: string | null
          interview_scheduled_at: string | null
          interview_completed_at: string | null
          decided_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          scholar_id?: string | null
          application_number: string
          ijazah_type: string
          status?: string
          personal_info?: Json
          academic_background?: Json
          quran_experience?: Json
          prerequisites?: Json | null
          documents?: Json | null
          reviewer_notes?: string | null
          interview_notes?: string | null
          prerequisites_verified?: boolean
          submitted_at?: string | null
          reviewed_at?: string | null
          interview_scheduled_at?: string | null
          interview_completed_at?: string | null
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          scholar_id?: string | null
          application_number?: string
          ijazah_type?: string
          status?: string
          personal_info?: Json
          academic_background?: Json
          quran_experience?: Json
          prerequisites?: Json | null
          documents?: Json | null
          reviewer_notes?: string | null
          interview_notes?: string | null
          prerequisites_verified?: boolean
          submitted_at?: string | null
          reviewed_at?: string | null
          interview_scheduled_at?: string | null
          interview_completed_at?: string | null
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ijazah_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ijazah_applications_scholar_id_fkey"
            columns: ["scholar_id"]
            isOneToOne: false
            referencedRelation: "scholars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      ijazah_type: "hifz" | "qirat" | "tajweed" | "sanad"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "interview_scheduled"
        | "approved"
        | "rejected"
        | "expired"
        | "withdrawn"
    }
    CompositeTypes: {}
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
