// components/EditTuitionModal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Edit, BookOpen, Loader2, MapPin, Calendar } from "lucide-react"
import { useSupabase } from "@/lib/supabase"
import { toast } from "sonner"

const SUBJECTS = [
  "Mathematics",
  "Physics", 
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "Economics",
  "Accounting",
  "ICT",
  "General Science",
  "Social Science",
  "Other",
]

const DAYS_OF_WEEK = [
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
]

interface EditTuitionModalProps {
  tuition: {
    id: string
    name: string
    subject: string
    description?: string
    address?: string
    teaching_days?: string[]
    days_per_week?: number
  }
  onTuitionUpdated: () => void
}

type TuitionFormData = {
  name: string
  subject: string
  description: string
  address: string
  teaching_days: string[]
}

function EditTuitionModal({ tuition, onTuitionUpdated }: EditTuitionModalProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = useSupabase()
  const [formData, setFormData] = useState<TuitionFormData>({
    name: "",
    subject: "",
    description: "",
    address: "",
    teaching_days: [],
  })

  // Initialize form data when tuition prop changes or modal opens
  useEffect(() => {
    if (open && tuition) {
      setFormData({
        name: tuition.name,
        subject: tuition.subject,
        description: tuition.description || "",
        address: tuition.address || "",
        teaching_days: tuition.teaching_days || [],
      })
    }
  }, [tuition, open])

  const handleInputChange = (field: keyof Omit<TuitionFormData, 'teaching_days'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDayToggle = (dayId: string) => {
    setFormData((prev) => ({
      ...prev,
      teaching_days: prev.teaching_days.includes(dayId)
        ? prev.teaching_days.filter((d) => d !== dayId)
        : [...prev.teaching_days, dayId],
    }))
  }

  const resetForm = () => {
    setFormData({
      name: tuition.name,
      subject: tuition.subject,
      description: tuition.description || "",
      address: tuition.address || "",
      teaching_days: tuition.teaching_days || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.subject ||
      !formData.address.trim() ||
      formData.teaching_days.length === 0
    ) {
      toast.error("Please fill in all required fields and select at least one teaching day")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("tuitions")
        .update({
          name: formData.name.trim(),
          subject: formData.subject,
          description: formData.description.trim() || null,
          address: formData.address.trim(),
          teaching_days: formData.teaching_days,
          days_per_week: formData.teaching_days.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tuition.id)

      if (error) {
        console.error("Error updating tuition:", error)
        
        if (error.code === '42501') {
          toast.error("You don't have permission to update this tuition")
        } else {
          toast.error("Failed to update tuition. Please try again.")
        }
        return
      }

      toast.success("Tuition updated successfully!")
      setOpen(false)
      onTuitionUpdated()
    } catch (error: any) {
      console.error("Error updating tuition:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start bg-gradient-to-r from-background to-accent/5 border-border/50 hover:from-accent/10 hover:to-accent/20"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Tuition Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            Edit Tuition: {tuition.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Tuition Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Tuition Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Morning Batch - Class 10"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-foreground">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-foreground">
              Tuition Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                type="text"
                placeholder="e.g., House 123, Road 5, Dhanmondi, Dhaka"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full pl-10"
                required
              />
            </div>
          </div>

          {/* Teaching Days */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Teaching Days <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${day.id}`}
                    checked={formData.teaching_days.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80"
                  />
                  <label
                    htmlFor={`edit-${day.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
            {formData.teaching_days.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formData.teaching_days.length} day{formData.teaching_days.length > 1 ? "s" : ""} per week:{" "}
                  {formData.teaching_days
                    .map((dayId) => DAYS_OF_WEEK.find((d) => d.id === dayId)?.short)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add details about this tuition, schedule, or any special notes..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                !formData.subject ||
                !formData.address.trim() ||
                formData.teaching_days.length === 0
              }
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Tuition...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Update Tuition
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
              className="w-full sm:w-auto bg-background/80 backdrop-blur-sm"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Tips Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-violet-50/50 to-purple-50/50 border border-violet-200/50 rounded-lg dark:from-violet-950/20 dark:to-purple-950/20 dark:border-violet-800/50">
          <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Update Tips
          </h4>
          <ul className="text-sm text-violet-800 dark:text-violet-200 space-y-1">
            <li>• Changes will be applied immediately</li>
            <li>• Students and class data will remain unchanged</li>
            <li>• Updated schedule will apply to future classes</li>
            <li>• All existing data will be preserved</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { EditTuitionModal }
export default EditTuitionModal