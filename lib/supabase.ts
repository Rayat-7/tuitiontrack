// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Since we're using Clerk for auth
  },
})

// For server-side operations, you might want to use the service role key
// Only use this for server-side operations where you need to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Types for database (keep existing types)
export type User = {
  id: string
  clerk_id: string
  email: string
  role: "admin" | "tutor" | "coaching_center"
  name: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Tuition = {
  id: string
  name: string
  subject: string
  description?: string
  tutor_id: string
  status: "active" | "archived"
  created_at: string
  updated_at: string
}

export type Student = {
  id: string
  name: string
  phone?: string
  parent_phone?: string
  class_level: string
  tuition_id: string
  fee_per_month: number
  created_at: string
}

export type Attendance = {
  id: string
  student_id: string
  tuition_id: string
  date: string
  is_present: boolean
  created_at: string
}

export type ClassLog = {
  id: string
  tuition_id: string
  date: string
  topics_covered: string
  homework_given?: string
  notes?: string
  exam_topic?: string
  created_at: string
  updated_at: string
}

export type FeeRecord = {
  id: string
  student_id: string
  tuition_id: string
  month: string
  year: number
  amount: number
  status: "paid" | "due" | "partial"
  paid_date?: string
  created_at: string
}




// // lib/supabase.ts
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// // Types for  database
// export type User = {
//   id: string
//   email: string
//   role: 'admin' | 'tutor' | 'coaching_center'
//   name: string
//   phone?: string
//   is_active: boolean
//   created_at: string
// }

// export type Tuition = {
//   id: string
//   name: string
//   subject: string
//   description?: string
//   tutor_id: string
//   status: 'active' | 'archived'
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
//   status: 'paid' | 'due' | 'partial'
//   paid_date?: string
//   created_at: string
// }
    