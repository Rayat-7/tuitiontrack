// components/EditStudentModal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, Loader2, Users, Phone, GraduationCap, DollarSign, Edit } from "lucide-react"
import { useSupabase } from "@/lib/supabase"
import { toast } from "sonner"

interface EditStudentModalProps {
  student: {
    id: string
    name: string
    phone?: string
    parent_phone?: string
    class_level: string
    fee_per_month: number
    notes?: string
  }
  onStudentUpdated: () => void
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

function EditStudentModal({ student, onStudentUpdated }: EditStudentModalProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = useSupabase()
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    phone: "",
    parent_phone: "",
    class_level: "",
    fee_per_month: "",
    notes: "",
  })

  // Initialize form data when student prop changes or modal opens
  useEffect(() => {
    if (open && student) {
      setFormData({
        name: student.name,
        phone: student.phone || "",
        parent_phone: student.parent_phone || "",
        class_level: student.class_level,
        fee_per_month: student.fee_per_month.toString(),
        notes: student.notes || "",
      })
    }
  }, [student, open])

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: student.name,
      phone: student.phone || "",
      parent_phone: student.parent_phone || "",
      class_level: student.class_level,
      fee_per_month: student.fee_per_month.toString(),
      notes: student.notes || "",
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
      const { error } = await supabase
        .from("students")
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          parent_phone: formData.parent_phone.trim() || null,
          class_level: formData.class_level,
          fee_per_month: feeAmount,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", student.id)

      if (error) {
        console.error("Error updating student:", error)
        
        if (error.code === '42501') {
          toast.error("You don't have permission to update this student")
        } else {
          toast.error("Failed to update student. Please try again.")
        }
        return
      }

      toast.success("Student updated successfully!")
      setOpen(false)
      onStudentUpdated()
    } catch (error: any) {
      console.error("Error updating student:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-blue-500/10 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Edit className="h-4 w-4 text-white" />
            </div>
            Edit Student: {student.name}
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
          </div>

          {/* Notes */}
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
                  Updating Student...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Update Student
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
      </DialogContent>
    </Dialog>
  )
}

export { EditStudentModal }
export default EditStudentModal