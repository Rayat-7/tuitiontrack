// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client with Clerk auth integration
export const createClerkSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      // Function to get the JWT token from Clerk
      fetch: async (url, options = {}) => {
        const clerkToken = await window.Clerk?.session?.getToken({
          template: 'supabase',
        })

        // Insert the Clerk Supabase JWT into the headers
        const headers = new Headers(options?.headers)
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`)
        }

        // Call the default fetch
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
}

// For server-side usage or when Clerk is not available
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hook to get Supabase client with Clerk auth
export const useSupabaseWithClerk = () => {
  const { getToken } = useAuth()
  
  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken({ template: 'supabase' })
        
        const headers = new Headers(options?.headers)
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`)
        }
        
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
  
  return supabaseWithAuth
}

// Database types (update according to your schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          name: string
          phone: string | null
          role: 'admin' | 'tutor' | 'coaching_center'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          name: string
          phone?: string | null
          role?: 'admin' | 'tutor' | 'coaching_center'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'admin' | 'tutor' | 'coaching_center'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tuitions: {
        Row: {
          id: string
          name: string
          subject: string
          description: string | null
          tutor_id: string | null
          status: 'active' | 'archived'
          created_at: string
          updated_at: string
          address: string | null
          teaching_days: string[] | null
          days_per_week: number | null
        }
        Insert: {
          id?: string
          name: string
          subject: string
          description?: string | null
          tutor_id?: string | null
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
          address?: string | null
          teaching_days?: string[] | null
          days_per_week?: number | null
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          description?: string | null
          tutor_id?: string | null
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
          address?: string | null
          teaching_days?: string[] | null
          days_per_week?: number | null
        }
      }
      students: {
        Row: {
          id: string
          name: string
          phone: string | null
          parent_phone: string | null
          class_level: string
          tuition_id: string | null
          fee_per_month: number
          created_at: string
          updated_at: string
          status: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          parent_phone?: string | null
          class_level: string
          tuition_id?: string | null
          fee_per_month?: number
          created_at?: string
          updated_at?: string
          status?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          parent_phone?: string | null
          class_level?: string
          tuition_id?: string | null
          fee_per_month?: number
          created_at?: string
          updated_at?: string
          status?: string | null
          notes?: string | null
        }
      }
      class_logs: {
        Row: {
          id: string
          tuition_id: string
          class_date: string
          was_conducted: boolean
          topic_covered: string | null
          notes: string | null
          attendance_data: any | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tuition_id: string
          class_date: string
          was_conducted?: boolean
          topic_covered?: string | null
          notes?: string | null
          attendance_data?: any | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tuition_id?: string
          class_date?: string
          was_conducted?: boolean
          topic_covered?: string | null
          notes?: string | null
          attendance_data?: any | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fee_records: {
        Row: {
          id: string
          student_id: string | null
          tuition_id: string | null
          month: string
          year: number
          amount: number
          status: string
          paid_date: string | null
          created_at: string
          additional_notes: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          tuition_id?: string | null
          month: string
          year: number
          amount: number
          status?: string
          paid_date?: string | null
          created_at?: string
          additional_notes?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          tuition_id?: string | null
          month?: string
          year?: number
          amount?: number
          status?: string
          paid_date?: string | null
          created_at?: string
          additional_notes?: string | null
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string | null
          tuition_id: string | null
          date: string
          is_present: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          tuition_id?: string | null
          date: string
          is_present?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          tuition_id?: string | null
          date?: string
          is_present?: boolean
          created_at?: string
        }
      }
      archived_items: {
        Row: {
          id: string
          item_type: string
          item_id: string
          original_data: any
          archived_by: string | null
          archived_at: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_type: string
          item_id: string
          original_data: any
          archived_by?: string | null
          archived_at?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_type?: string
          item_id?: string
          original_data?: any
          archived_by?: string | null
          archived_at?: string | null
          reason?: string | null
          created_at?: string
        }
      }
    }
  }
}






// // lib/supabase.ts
// import { createClient } from "@supabase/supabase-js"

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// // Create a single supabase client for interacting with your database
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: false, // Since we're using Clerk for auth
//   },
// })

// // For server-side operations, you might want to use the service role key
// // Only use this for server-side operations where you need to bypass RLS
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
// export const supabaseAdmin = supabaseServiceKey
//   ? createClient(supabaseUrl, supabaseServiceKey, {
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false,
//       },
//     })
//   : null

// // Types for database (keep existing types)
// export type User = {
//   id: string
//   clerk_id: string
//   email: string
//   role: "admin" | "tutor" | "coaching_center"
//   name: string
//   phone?: string
//   is_active: boolean
//   created_at: string
//   updated_at: string
// }

// export type Tuition = {
//   id: string
//   name: string
//   subject: string
//   description?: string
//   tutor_id: string
//   status: "active" | "archived"
//   created_at: string
//   updated_at: string
// }

// export type Student = {
//   id: string
//   name: string
//   phone?: string
//   parent_phone?: string
//   class_level: string
//   tuition_id: string
//   fee_per_month: number
//   created_at: string
// }

// export type Attendance = {
//   id: string
//   student_id: string
//   tuition_id: string
//   date: string
//   is_present: boolean
//   created_at: string
// }

// export type ClassLog = {
//   id: string
//   tuition_id: string
//   date: string
//   topics_covered: string
//   homework_given?: string
//   notes?: string
//   exam_topic?: string
//   created_at: string
//   updated_at: string
// }

// export type FeeRecord = {
//   id: string
//   student_id: string
//   tuition_id: string
//   month: string
//   year: number
//   amount: number
//   status: "paid" | "due" | "partial"
//   paid_date?: string
//   created_at: string
// }




