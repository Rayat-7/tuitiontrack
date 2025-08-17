// components/EditClassLogModal.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Save, X, Loader2, Trash2, AlertTriangle } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Create authenticated Supabase client
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

type ClassLog = {
  id: string
  class_date: string
  was_conducted: boolean
  topic_covered?: string
  notes?: string
  attendance_data?: any
}

interface EditClassLogModalProps {
  classLog: ClassLog
  onClassLogUpdated: () => void
  onClassLogDeleted: () => void
}

export default function EditClassLogModal({ 
  classLog, 
  onClassLogUpdated, 
  onClassLogDeleted 
}: EditClassLogModalProps) {
  const supabase = useAuthenticatedSupabase()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    topic_covered: classLog.topic_covered || "",
    notes: classLog.notes || "",
    was_conducted: classLog.was_conducted,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("class_logs")
        .update({
          topic_covered: formData.topic_covered.trim() || null,
          notes: formData.notes.trim() || null,
          was_conducted: formData.was_conducted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", classLog.id)

      if (error) {
        console.error("Error updating class log:", error)
        toast.error("Failed to update class log")
        return
      }

      toast.success("Class log updated successfully")
      setOpen(false)
      onClassLogUpdated()
    } catch (error) {
      console.error("Error updating class log:", error)
      toast.error("Failed to update class log")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { error } = await supabase
        .from("class_logs")
        .delete()
        .eq("id", classLog.id)

      if (error) {
        console.error("Error deleting class log:", error)
        toast.error("Failed to delete class log")
        return
      }

      toast.success("Class log deleted successfully")
      setDeleteDialogOpen(false)
      setOpen(false)
      onClassLogDeleted()
    } catch (error) {
      console.error("Error deleting class log:", error)
      toast.error("Failed to delete class log")
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:from-blue-500/20 hover:to-cyan-500/20"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Class Log
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Class Log
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(classLog.class_date)}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="was_conducted"
                checked={formData.was_conducted}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    was_conducted: checked as boolean,
                  }))
                }
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
              />
              <Label htmlFor="was_conducted" className="font-medium">
                Class was conducted
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic_covered">Topic Covered</Label>
              <Input
                id="topic_covered"
                value={formData.topic_covered}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    topic_covered: e.target.value,
                  }))
                }
                placeholder="What topic was covered in this class?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Any additional notes about the class..."
                rows={3}
              />
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Class Log
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class log for {formatDate(classLog.class_date)}? 
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class Log
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}