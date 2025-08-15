// components/AddStudentModal.tsx - Updated with authenticated Supabase client
"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Loader2, Users, Phone, GraduationCap, DollarSign, Plus } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const useAuthenticatedSupabase = () => {
  const { getToken } = useAuth()
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  return supabase
}

interface AddStudentModalProps {
  tuitionId: string
  onStudentAdded: () => void
}

type StudentFormData = {
  name: string
  phone: string
  parent_phone: string
  class_level: string
  fee_per_month: string
  notes: string
}

const CLASS_LEVELS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "HSC 1st Year", "HSC 2nd Year",
  "Honors 1st Year", "Honors 2nd Year", "Honors 3rd Year", "Honors 4th Year",
  "Masters", "Other",
]

function AddStudentModal({ tuitionId, onStudentAdded }: AddStudentModalProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = useAuthenticatedSupabase()
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    phone: "",
    parent_phone: "",
    class_level: "",
    fee_per_month: "",
    notes: "",
  })

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      parent_phone: "",
      class_level: "",
      fee_per_month: "",
      notes: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.class_level || !formData.fee_per_month) {
      toast.error("Please fill in all required fields")
      return
    }

    const feeAmount = Number.parseFloat(formData.fee_per_month)
    if (isNaN(feeAmount) || feeAmount < 0) {
      toast.error("Please enter a valid fee amount")
      return
    }

    setLoading(true)

    try {
      // Insert student - RLS will automatically ensure this is for a tuition the user owns
      const { error } = await supabase.from("students").insert({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        parent_phone: formData.parent_phone.trim() || null,
        class_level: formData.class_level,
        fee_per_month: feeAmount,
        tuition_id: tuitionId,
        status: "active",
        notes: formData.notes.trim() || null,
      })

      if (error) {
        console.error("Error adding student:", error)
        
        // Provide more specific error messages
        if (error.code === '42501') {
          toast.error("You don't have permission to add students to this tuition")
        } else if (error.code === '23503') {
          toast.error("Invalid tuition ID")
        } else {
          toast.error("Failed to add student. Please try again.")
        }
        return
      }

      toast.success("Student added successfully!")
      resetForm()
      setOpen(false)
      onStudentAdded()
    } catch (error: any) {
      console.error("Error adding student:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            Add New Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter student's full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
                required
              />
            </div>

            {/* Class Level */}
            <div className="space-y-2">
              <Label htmlFor="class_level" className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Class Level <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.class_level} onValueChange={(value) => handleInputChange("class_level", value)}>
                <SelectTrigger className="bg-gradient-to-r from-background to-accent/5 border-border/50">
                  <SelectValue placeholder="Select class level" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Student Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter student's phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Parent Phone */}
            <div className="space-y-2">
              <Label htmlFor="parent_phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Parent Phone
              </Label>
              <Input
                id="parent_phone"
                type="tel"
                placeholder="Enter parent's phone number"
                value={formData.parent_phone}
                onChange={(e) => handleInputChange("parent_phone", e.target.value)}
                className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Fee Amount */}
          <div className="space-y-2">
            <Label htmlFor="fee_per_month" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Fee (৳) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fee_per_month"
              type="number"
              placeholder="Enter monthly fee amount"
              value={formData.fee_per_month}
              onChange={(e) => handleInputChange("fee_per_month", e.target.value)}
              className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
              min="0"
              step="0.01"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be the default monthly fee for this student
            </p>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional Notes (Optional)
            </Label>
            <Input
              id="notes"
              type="text"
              placeholder="Any special notes about this student..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.class_level || !formData.fee_per_month}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Student...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              disabled={loading}
              className="sm:w-auto bg-gradient-to-r from-background to-accent/5 border-border/50 hover:from-accent/10 hover:to-accent/20"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-200/50 rounded-lg dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800/50">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Quick Tips
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Phone numbers are optional but help with communication</li>
            <li>• Monthly fee can be adjusted individually for each student</li>
            <li>• Use notes for special requirements or reminders</li>
            <li>• You can edit student details after creation</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AddStudentModal }
export default AddStudentModal













// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { UserPlus, Loader2, Users, Phone, GraduationCap, DollarSign, Plus } from "lucide-react"
// import { supabase } from "@/lib/supabase"
// import { toast } from "sonner"
// import { useUser } from "@clerk/nextjs"

// interface AddStudentModalProps {
//   tuitionId: string
//   onStudentAdded: () => void
// }

// type StudentFormData = {
//   name: string
//   phone: string
//   parent_phone: string
//   class_level: string
//   fee_per_month: string
//   notes: string
// }

// const CLASS_LEVELS = [
//   "Class 1",
//   "Class 2",
//   "Class 3",
//   "Class 4",
//   "Class 5",
//   "Class 6",
//   "Class 7",
//   "Class 8",
//   "Class 9",
//   "Class 10",
//   "HSC 1st Year",
//   "HSC 2nd Year",
//   "Honors 1st Year",
//   "Honors 2nd Year",
//   "Honors 3rd Year",
//   "Honors 4th Year",
//   "Masters",
//   "Other",
// ]

// function AddStudentModal({ tuitionId, onStudentAdded }: AddStudentModalProps) {
//   const [loading, setLoading] = useState(false)
//   const [open, setOpen] = useState(false)
//   const { user } = useUser()
//   const [formData, setFormData] = useState<StudentFormData>({
//     name: "",
//     phone: "",
//     parent_phone: "",
//     class_level: "",
//     fee_per_month: "",
//     notes: "",
//   })

//   const handleInputChange = (field: keyof StudentFormData, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       phone: "",
//       parent_phone: "",
//       class_level: "",
//       fee_per_month: "",
//       notes: "",
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.name.trim() || !formData.class_level || !formData.fee_per_month) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     if (!user) {
//       toast.error("User not authenticated")
//       return
//     }

//     setLoading(true)

//     try {
//       // Get user's ID from Supabase
//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single()

//       if (userError || !userData) {
//         throw new Error("User not found in database")
//       }

//       const { error } = await supabase.from("students").insert({
//         name: formData.name.trim(),
//         phone: formData.phone.trim() || null,
//         parent_phone: formData.parent_phone.trim() || null,
//         class_level: formData.class_level,
//         fee_per_month: Number.parseFloat(formData.fee_per_month),
//         tuition_id: tuitionId,
//         status: "active",
//       })

//       if (error) throw error

//       toast.success("Student added successfully!")
//       resetForm()
//       setOpen(false)
//       onStudentAdded()
//     } catch (error: any) {
//       console.error("Error adding student:", error)
//       toast.error(error.message || "Failed to add student. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg">
//           <Plus className="h-4 w-4 mr-2" />
//           Add Student
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-xl">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
//               <Users className="h-4 w-4 text-white" />
//             </div>
//             Add New Student
//           </DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6 mt-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Student Name */}
//             <div className="space-y-2">
//               <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
//                 <Users className="h-4 w-4" />
//                 Student Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="name"
//                 type="text"
//                 placeholder="Enter student's full name"
//                 value={formData.name}
//                 onChange={(e) => handleInputChange("name", e.target.value)}
//                 className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
//                 required
//               />
//             </div>

//             {/* Class Level */}
//             <div className="space-y-2">
//               <Label htmlFor="class_level" className="text-sm font-medium flex items-center gap-2">
//                 <GraduationCap className="h-4 w-4" />
//                 Class Level <span className="text-red-500">*</span>
//               </Label>
//               <Select value={formData.class_level} onValueChange={(value) => handleInputChange("class_level", value)}>
//                 <SelectTrigger className="bg-gradient-to-r from-background to-accent/5 border-border/50">
//                   <SelectValue placeholder="Select class level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {CLASS_LEVELS.map((level) => (
//                     <SelectItem key={level} value={level}>
//                       {level}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Student Phone */}
//             <div className="space-y-2">
//               <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
//                 <Phone className="h-4 w-4" />
//                 Student Phone
//               </Label>
//               <Input
//                 id="phone"
//                 type="tel"
//                 placeholder="Enter student's phone number"
//                 value={formData.phone}
//                 onChange={(e) => handleInputChange("phone", e.target.value)}
//                 className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
//               />
//             </div>

//             {/* Parent Phone */}
//             <div className="space-y-2">
//               <Label htmlFor="parent_phone" className="text-sm font-medium flex items-center gap-2">
//                 <Phone className="h-4 w-4" />
//                 Parent Phone
//               </Label>
//               <Input
//                 id="parent_phone"
//                 type="tel"
//                 placeholder="Enter parent's phone number"
//                 value={formData.parent_phone}
//                 onChange={(e) => handleInputChange("parent_phone", e.target.value)}
//                 className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
//               />
//             </div>
//           </div>

//           {/* Fee Amount */}
//           <div className="space-y-2">
//             <Label htmlFor="fee_per_month" className="text-sm font-medium flex items-center gap-2">
//               <DollarSign className="h-4 w-4" />
//               Monthly Fee (৳) <span className="text-red-500">*</span>
//             </Label>
//             <Input
//               id="fee_per_month"
//               type="number"
//               placeholder="Enter monthly fee amount"
//               value={formData.fee_per_month}
//               onChange={(e) => handleInputChange("fee_per_month", e.target.value)}
//               className="bg-gradient-to-r from-background to-accent/5 border-border/50 focus:border-primary/50"
//               min="0"
//               step="0.01"
//               required
//             />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-3 pt-4">
//             <Button
//               type="submit"
//               disabled={loading || !formData.name.trim() || !formData.class_level || !formData.fee_per_month}
//               className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Adding Student...
//                 </>
//               ) : (
//                 <>
//                   <UserPlus className="mr-2 h-4 w-4" />
//                   Add Student
//                 </>
//               )}
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setOpen(false)}
//               className="sm:w-auto bg-gradient-to-r from-background to-accent/5 border-border/50 hover:from-accent/10 hover:to-accent/20"
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export { AddStudentModal }
// export default AddStudentModal

