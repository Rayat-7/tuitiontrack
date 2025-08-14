"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Archive,
  Users,
  BookOpen,
  RotateCcw,
  Trash2,
  Calendar,
  MapPin,
  GraduationCap,
  DollarSign,
  Phone,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type ArchivedItem = {
  id: string
  item_type: string
  item_id: string
  original_data: any
  archived_at: string
  reason?: string
}

export default function ArchivePage() {
  const { user, isLoaded } = useUser()
  const [archivedTuitions, setArchivedTuitions] = useState<ArchivedItem[]>([])
  const [archivedStudents, setArchivedStudents] = useState<ArchivedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tuitions")

  useEffect(() => {
    if (isLoaded && user) {
      fetchArchivedItems()
    }
  }, [isLoaded, user])

  const fetchArchivedItems = async () => {
    try {
      setLoading(true)

      // Get user's ID from Supabase
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user?.id)
        .single()

      if (userError || !userData) {
        toast.error("User not found")
        return
      }

      // Fetch archived tuitions
      const { data: archivedTuitionsData, error: tuitionsError } = await supabase
        .from("tuitions")
        .select("*")
        .eq("created_by", userData.id)
        .eq("status", "archived")
        .order("updated_at", { ascending: false })

      if (tuitionsError) {
        console.error("Error fetching archived tuitions:", tuitionsError)
        toast.error("Failed to load archived tuitions")
        return
      }

      // Fetch archived students
      const { data: archivedStudentsData, error: studentsError } = await supabase
        .from("students")
        .select(`
          *,
          tuitions!inner(name, subject, created_by)
        `)
        .eq("tuitions.created_by", userData.id)
        .eq("status", "archived")
        .order("updated_at", { ascending: false })

      if (studentsError) {
        console.error("Error fetching archived students:", studentsError)
        toast.error("Failed to load archived students")
        return
      }

      // Transform data to match the expected format
      const tuitions =
        archivedTuitionsData?.map((tuition) => ({
          id: tuition.id,
          item_type: "tuition",
          item_id: tuition.id,
          original_data: tuition,
          archived_at: tuition.updated_at,
          reason: "Archived by user",
        })) || []

      const students =
        archivedStudentsData?.map((student) => ({
          id: student.id,
          item_type: "student",
          item_id: student.id,
          original_data: student,
          archived_at: student.updated_at,
          reason: "Archived by user",
        })) || []

      setArchivedTuitions(tuitions)
      setArchivedStudents(students)
    } catch (error) {
      console.error("Error fetching archived items:", error)
      toast.error("Failed to load archived items")
    } finally {
      setLoading(false)
    }
  }

  const restoreItem = async (archiveId: string, itemType: string, itemName: string) => {
    if (!confirm(`Are you sure you want to restore ${itemName}? It will be moved back to active status.`)) {
      return
    }

    try {
      const tableName = itemType === "tuition" ? "tuitions" : "students"

      const { error } = await supabase
        .from(tableName)
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", archiveId)

      if (error) throw error

      toast.success(`${itemName} has been restored`)
      fetchArchivedItems() // Refresh the list
    } catch (error) {
      console.error("Error restoring item:", error)
      toast.error("Failed to restore item")
    }
  }

  const permanentlyDelete = async (archiveId: string, itemType: string, itemName: string) => {
    if (
      !confirm(
        `⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete ${itemName}?\n\nThis action CANNOT be undone. All data will be lost forever.`,
      )
    ) {
      return
    }

    // Double confirmation for permanent delete
    if (
      !confirm(
        `This is your final warning. Type "DELETE" in the next prompt to confirm permanent deletion of ${itemName}.`,
      )
    ) {
      return
    }

    const userConfirmation = prompt(`Type "DELETE" to permanently delete ${itemName}:`)
    if (userConfirmation !== "DELETE") {
      toast.error("Deletion cancelled - confirmation text did not match")
      return
    }

    try {
      const tableName = itemType === "tuition" ? "tuitions" : "students"

      const { error } = await supabase.from(tableName).delete().eq("id", archiveId)

      if (error) throw error

      toast.success(`${itemName} has been permanently deleted`)
      fetchArchivedItems() // Refresh the list
    } catch (error) {
      console.error("Error permanently deleting item:", error)
      toast.error("Failed to permanently delete item")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`
  }

  const getTeachingDaysDisplay = (days?: string[]) => {
    if (!days || days.length === 0) return "Not set"
    const DAYS_OF_WEEK = [
      { id: "saturday", short: "Sat" },
      { id: "sunday", short: "Sun" },
      { id: "monday", short: "Mon" },
      { id: "tuesday", short: "Tue" },
      { id: "wednesday", short: "Wed" },
      { id: "thursday", short: "Thu" },
      { id: "friday", short: "Fri" },
    ]
    return days.map((dayId) => DAYS_OF_WEEK.find((d) => d.id === dayId)?.short || dayId).join(", ")
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/3"></div>
          <div className="h-96 bg-gradient-to-br from-muted to-muted/50 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
            <Archive className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Archive
            </h1>
            <p className="text-muted-foreground text-lg">Manage your archived tuitions and students</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-orange-600">{archivedTuitions.length}</div>
                  <p className="text-xs text-muted-foreground">Archived Tuitions</p>
                </div>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-blue-600">{archivedStudents.length}</div>
                  <p className="text-xs text-muted-foreground">Archived Students</p>
                </div>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-gradient-to-r from-background to-accent/10 border border-border/50">
            <TabsTrigger
              value="tuitions"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            >
              <BookOpen className="h-4 w-4" />
              Tuitions ({archivedTuitions.length})
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            >
              <Users className="h-4 w-4" />
              Students ({archivedStudents.length})
            </TabsTrigger>
          </TabsList>

          {/* Archived Tuitions Tab */}
          <TabsContent value="tuitions">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader>
                <CardTitle className="text-xl">Archived Tuitions</CardTitle>
              </CardHeader>
              <CardContent>
                {archivedTuitions.length > 0 ? (
                  <div className="space-y-4">
                    {archivedTuitions.map((item) => {
                      const tuition = item.original_data
                      return (
                        <div
                          key={item.id}
                          className="p-6 border rounded-xl bg-gradient-to-br from-background to-accent/5 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-lg">{tuition.name}</h3>
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-500/10 text-orange-700 dark:text-orange-400"
                                >
                                  Archived
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-2">{tuition.subject}</p>
                              {tuition.address && (
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {tuition.address}
                                </p>
                              )}
                              {tuition.teaching_days && tuition.teaching_days.length > 0 && (
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {tuition.days_per_week} days/week: {getTeachingDaysDisplay(tuition.teaching_days)}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Archived: {formatDate(item.archived_at)}</span>
                                {item.reason && <span>Reason: {item.reason}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20 text-green-700 dark:text-green-400"
                                onClick={() => restoreItem(item.id, item.item_type, tuition.name)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                                onClick={() => permanentlyDelete(item.id, item.item_type, tuition.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Forever
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="font-medium mb-2 text-lg">No archived tuitions</h3>
                    <p className="text-muted-foreground">Archived tuitions will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archived Students Tab */}
          <TabsContent value="students">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader>
                <CardTitle className="text-xl">Archived Students</CardTitle>
              </CardHeader>
              <CardContent>
                {archivedStudents.length > 0 ? (
                  <div className="space-y-4">
                    {archivedStudents.map((item) => {
                      const student = item.original_data
                      return (
                        <div
                          key={item.id}
                          className="p-6 border rounded-xl bg-gradient-to-br from-background to-accent/5 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-lg">{student.name}</h3>
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                  Archived
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {student.class_level}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(student.fee_per_month)}/month
                                </span>
                              </div>
                              {(student.phone || student.parent_phone) && (
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                  {student.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {student.phone}
                                    </span>
                                  )}
                                  {student.parent_phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      Parent: {student.parent_phone}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Archived: {formatDate(item.archived_at)}</span>
                                {item.reason && <span>Reason: {item.reason}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20 text-green-700 dark:text-green-400"
                                onClick={() => restoreItem(item.id, item.item_type, student.name)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                                onClick={() => permanentlyDelete(item.id, item.item_type, student.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Forever
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-medium mb-2 text-lg">No archived students</h3>
                    <p className="text-muted-foreground">Archived students will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
