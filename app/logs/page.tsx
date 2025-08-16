"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, Users, ArrowLeft, BookOpen, CheckCircle2, XCircle, Clock, FileText, Save, Edit3 } from "lucide-react"
import { format, isToday, isFuture, isPast, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

interface Tuition {
  id: string
  name: string
  subject: string
  studentCount: number
  teaching_days: string[]
}

interface ClassLog {
  id: string
  class_date: string
  was_conducted: boolean
  topic_covered?: string
  notes?: string
}

export default function ClassLogsPage() {
  const { user, isLoaded } = useUser()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [classLogs, setClassLogs] = useState<ClassLog[]>([])
  const [currentClassLog, setCurrentClassLog] = useState<ClassLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Form states
  const [wasConducted, setWasConducted] = useState(false)
  const [topicCovered, setTopicCovered] = useState("")
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  useEffect(() => {
    if (isLoaded && user) {
      getCurrentUserId()
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (currentUserId) {
      fetchTuitions()
    }
  }, [currentUserId])

  useEffect(() => {
    if (selectedTuition) {
      fetchClassLogs()
    }
  }, [selectedTuition, refreshTrigger])

  useEffect(() => {
    if (selectedTuition && selectedDate) {
      fetchClassLogForDate()
    }
  }, [selectedTuition, selectedDate, classLogs])

  const getCurrentUserId = async () => {
    try {
      const { data: userData, error } = await supabase.from("users").select("id").eq("clerk_id", user?.id).single()

      if (error) {
        console.error("Error fetching user:", error)
        toast.error("Failed to get user information")
        return
      }

      setCurrentUserId(userData.id)
    } catch (error) {
      console.error("Error getting current user ID:", error)
      toast.error("Failed to authenticate user")
    }
  }

  const fetchTuitions = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("tuitions")
        .select(`
          id,
          name,
          subject,
          teaching_days,
          students!inner(id)
        `)
        .eq("tutor_id", currentUserId)
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error fetching tuitions:", error)
        toast.error("Failed to fetch tuitions")
        return
      }

      const tuitionsWithCount: Tuition[] =
        data?.map((tuition) => ({
          id: tuition.id,
          name: tuition.name,
          subject: tuition.subject,
          teaching_days: tuition.teaching_days || [],
          studentCount: tuition.students?.length || 0,
        })) || []

      setTuitions(tuitionsWithCount)
    } catch (error) {
      console.error("Error fetching tuitions:", error)
      toast.error("Failed to fetch tuitions")
    } finally {
      setLoading(false)
    }
  }

  const fetchClassLogs = async () => {
    if (!selectedTuition) return

    try {
      const { data, error } = await supabase
        .from("class_logs")
        .select("id, class_date, was_conducted, topic_covered, notes")
        .eq("tuition_id", selectedTuition.id)
        .order("class_date", { ascending: false })

      if (error) {
        console.error("Error fetching class logs:", error)
        return
      }
      
      setClassLogs(data || [])
    } catch (error) {
      console.error("Error fetching class logs:", error)
    }
  }

  const fetchClassLogForDate = async () => {
    if (!selectedTuition || !selectedDate) return

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const existingLog = classLogs.find(log => log.class_date === dateStr)
    
    if (existingLog) {
      setCurrentClassLog(existingLog)
      setWasConducted(existingLog.was_conducted)
      setTopicCovered(existingLog.topic_covered || "")
      setNotes(existingLog.notes || "")
      setIsEditing(false)
    } else {
      setCurrentClassLog(null)
      setWasConducted(false)
      setTopicCovered("")
      setNotes("")
      setIsEditing(true) // Start in editing mode for new logs
    }
  }

  const saveClassLog = async () => {
    if (!selectedTuition || !selectedDate) return

    try {
      setSaving(true)
      const dateStr = format(selectedDate, "yyyy-MM-dd")

      const logData = {
        tuition_id: selectedTuition.id,
        class_date: dateStr,
        was_conducted: wasConducted,
        topic_covered: topicCovered.trim() || null,
        notes: notes.trim() || null,
        created_by: currentUserId,
        updated_at: new Date().toISOString(),
      }

      let result
      if (currentClassLog) {
        // Update existing log
        result = await supabase
          .from("class_logs")
          .update(logData)
          .eq("id", currentClassLog.id)
      } else {
        // Create new log
        result = await supabase
          .from("class_logs")
          .insert({
            ...logData,
            created_at: new Date().toISOString(),
          })
      }

      if (result.error) {
        console.error("Error saving class log:", result.error)
        toast.error("Failed to save class log")
        return
      }

      toast.success(currentClassLog ? "Class log updated!" : "Class log created!")
      setIsEditing(false)
      forceRefresh()
    } catch (error) {
      console.error("Error saving class log:", error)
      toast.error("Failed to save class log")
    } finally {
      setSaving(false)
    }
  }

  // Helper function to convert day names to numbers (0=Sunday, 1=Monday, etc.)
  const dayNameToNumber = (dayName: string): number => {
    const days = {
      'sunday': 0, 'sun': 0,
      'monday': 1, 'mon': 1,
      'tuesday': 2, 'tue': 2,
      'wednesday': 3, 'wed': 3,
      'thursday': 4, 'thu': 4,
      'friday': 5, 'fri': 5,
      'saturday': 6, 'sat': 6
    }
    return days[dayName.toLowerCase()] ?? -1
  }

  // Check if a date is a scheduled class day
  const isScheduledClassDay = (date: Date): boolean => {
    if (!selectedTuition?.teaching_days) return false
    const dayOfWeek = getDay(date)
    return selectedTuition.teaching_days.some(day => dayNameToNumber(day) === dayOfWeek)
  }

  // Check if class was logged for a date
  const hasClassLog = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd")
    return classLogs.some(log => log.class_date === dateStr)
  }

  // Check if class was conducted for a date
  const wasClassConducted = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd")
    return classLogs.some(log => log.class_date === dateStr && log.was_conducted)
  }

  // Get class status for a date
  const getDateClassStatus = (date: Date): 'scheduled' | 'conducted' | 'logged' | 'missed' | 'none' => {
    const isScheduled = isScheduledClassDay(date)
    const hasLog = hasClassLog(date)
    const wasConducted = wasClassConducted(date)
    
    if (wasConducted) return 'conducted'
    if (hasLog && !wasConducted) return 'logged'
    if (isScheduled && isPast(date) && !isToday(date)) return 'missed'
    if (isScheduled) return 'scheduled'
    return 'none'
  }

  // Custom day modifiers for calendar
  const getDayModifiers = () => {
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const scheduledDays: Date[] = []
    const conductedDays: Date[] = []
    const loggedDays: Date[] = []
    const missedDays: Date[] = []
    
    daysInMonth.forEach(date => {
      const status = getDateClassStatus(date)
      if (status === 'scheduled') scheduledDays.push(date)
      else if (status === 'conducted') conductedDays.push(date)
      else if (status === 'logged') loggedDays.push(date)
      else if (status === 'missed') missedDays.push(date)
    })
    
    return {
      scheduled: scheduledDays,
      conducted: conductedDays,
      logged: loggedDays,
      missed: missedDays
    }
  }

  const dayModifiers = getDayModifiers()

  const getDateStatus = () => {
    if (isFuture(selectedDate)) return "future"
    if (isToday(selectedDate)) return "today"
    return "past"
  }

  const getMonthlyStats = () => {
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const scheduledDays = daysInMonth.filter(date => isScheduledClassDay(date))
    const conductedClasses = daysInMonth.filter(date => wasClassConducted(date))
    const loggedClasses = daysInMonth.filter(date => hasClassLog(date))
    const missedClasses = scheduledDays.filter(date => 
      !hasClassLog(date) && isPast(date) && !isToday(date)
    )
    
    return {
      scheduled: scheduledDays.length,
      conducted: conductedClasses.length,
      logged: loggedClasses.length,
      missed: missedClasses.length,
      remaining: scheduledDays.filter(date => isFuture(date) || isToday(date)).length
    }
  }

  const dateStatus = getDateStatus()
  const monthlyStats = getMonthlyStats()

  if (!isLoaded || loading || !currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show tuition selection if no tuition is selected
  if (!selectedTuition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Class Logs
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">Select a tuition to manage class logs</p>
              </div>
            </div>
          </div>

          {/* Tuitions List */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Tuition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tuitions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-violet-500" />
                  </div>
                  <h3 className="font-medium mb-2 text-lg">No active tuitions</h3>
                  <p className="text-muted-foreground mb-6">Create a tuition first to manage class logs</p>
                  <Link href="/tuitions">
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                      Go to Tuitions
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {tuitions.map((tuition) => (
                    <Card
                      key={tuition.id}
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-background to-accent/5"
                      onClick={() => setSelectedTuition(tuition)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base md:text-lg truncate">{tuition.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{tuition.subject}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{tuition.studentCount} students</span>
                          </div>
                          {tuition.teaching_days && tuition.teaching_days.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarDays className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{tuition.teaching_days.join(", ")}</span>
                            </div>
                          )}
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                          Manage Class Logs
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show class logs interface for selected tuition
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedTuition(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent truncate">
                {selectedTuition.name}
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg truncate">
                {selectedTuition.subject} • Class Logs
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Calendar and Stats */}
          <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5" />
                {format(selectedDate, "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Monthly Stats */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="text-lg font-bold text-orange-600">{monthlyStats.scheduled}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Conducted</p>
                  <p className="text-lg font-bold text-green-600">{monthlyStats.conducted}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Logged</p>
                  <p className="text-lg font-bold text-blue-600">{monthlyStats.logged}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Missed</p>
                  <p className="text-lg font-bold text-red-600">{monthlyStats.missed}</p>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-orange-500/20 border-2 border-orange-500 flex-shrink-0"></div>
                  <span>Scheduled classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500/20 border-2 border-green-500 flex-shrink-0"></div>
                  <span>Conducted classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500/20 border-2 border-blue-500 flex-shrink-0"></div>
                  <span>Logged (not conducted)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500/20 border-2 border-red-500 flex-shrink-0"></div>
                  <span>Missed classes</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="calendar-wrapper">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border w-full calendar-custom"
                  modifiers={dayModifiers}
                  modifiersStyles={{
                    scheduled: { 
                      backgroundColor: 'rgba(249, 115, 22, 0.2)',
                      border: '2px solid rgb(249, 115, 22)',
                      borderRadius: '50%'
                    },
                    conducted: { 
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      border: '2px solid rgb(34, 197, 94)',
                      borderRadius: '50%'
                    },
                    logged: { 
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '2px solid rgb(59, 130, 246)',
                      borderRadius: '50%'
                    },
                    missed: { 
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgb(239, 68, 68)',
                      borderRadius: '50%'
                    }
                  }}
                />
              </div>

              {/* Current Date Status */}
              <div className="text-center">
                {dateStatus === "today" && (
                  <Badge variant="default" className="bg-blue-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Today
                  </Badge>
                )}
                {dateStatus === "past" && (
                  <Badge variant="outline">
                    {format(selectedDate, "MMM d, yyyy")}
                  </Badge>
                )}
                {dateStatus === "future" && (
                  <Badge variant="secondary">
                    {format(selectedDate, "MMM d, yyyy")}
                  </Badge>
                )}
              </div>

              {/* Class Status for Selected Date */}
              <div className="text-center p-3 md:p-4 rounded-lg border">
                {isScheduledClassDay(selectedDate) ? (
                  wasClassConducted(selectedDate) ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">Class Conducted</span>
                    </div>
                  ) : hasClassLog(selectedDate) ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <FileText className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">Class Logged</span>
                    </div>
                  ) : dateStatus === "future" ? (
                    <div className="flex items-center justify-center gap-2 text-orange-600">
                      <Clock className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">Scheduled Class</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">Missed Class</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="font-medium text-sm md:text-base">No Class Scheduled</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Class Log Details */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg md:text-xl">
                    Class Log - {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                  {currentClassLog && !isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex-shrink-0"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Class Conducted Toggle */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="was-conducted"
                      checked={wasConducted}
                      onCheckedChange={(checked) => setWasConducted(checked as boolean)}
                      disabled={!isEditing}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <Label htmlFor="was-conducted" className="text-base font-medium">
                      Class was conducted
                    </Label>
                  </div>

                  {/* Topic Covered */}
                  <div className="space-y-2">
                    <Label htmlFor="topic-covered" className="text-sm font-medium">
                      Topic Covered
                    </Label>
                    <Input
                      id="topic-covered"
                      placeholder="Enter the topic covered in this class..."
                      value={topicCovered}
                      onChange={(e) => setTopicCovered(e.target.value)}
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes about this class..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={!isEditing}
                      className="w-full min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={saveClassLog}
                        disabled={saving}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save Log
                          </>
                        )}
                      </Button>
                      {currentClassLog && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            // Reset to original values
                            setWasConducted(currentClassLog.was_conducted)
                            setTopicCovered(currentClassLog.topic_covered || "")
                            setNotes(currentClassLog.notes || "")
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Read-only view for existing logs */}
                  {!isEditing && currentClassLog && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={wasConducted ? "default" : "secondary"}
                          className={wasConducted ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                        >
                          {wasConducted ? "Conducted" : "Not Conducted"}
                        </Badge>
                      </div>
                      
                      {topicCovered && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Topic Covered</h4>
                          <p className="text-sm">{topicCovered}</p>
                        </div>
                      )}
                      
                      {notes && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
                          <p className="text-sm whitespace-pre-wrap">{notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No log exists message */}
                  {!currentClassLog && !isEditing && (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No class log found for this date</p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                      >
                        Create Class Log
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Class Logs */}
            {classLogs.length > 0 && (
              <Card className="mt-6 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Class Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classLogs.slice(0, 10).map((log) => {
                      const logDate = new Date(log.class_date)
                      const wasScheduled = isScheduledClassDay(logDate)
                      
                      return (
                        <div 
                          key={log.id} 
                          className={`p-3 rounded border cursor-pointer transition-all duration-200 hover:bg-accent/20 ${
                            format(logDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") 
                              ? "bg-accent/10 border-violet-200 dark:border-violet-800" 
                              : ""
                          }`}
                          onClick={() => setSelectedDate(logDate)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                              <span className="text-sm font-medium">{format(logDate, "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                ({format(logDate, "EEEE")})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!wasScheduled && (
                                <Badge variant="outline" className="text-xs">
                                  Extra
                                </Badge>
                              )}
                              <Badge 
                                variant={log.was_conducted ? "default" : "secondary"} 
                                className={`text-xs ${
                                  log.was_conducted 
                                    ? "bg-green-500 hover:bg-green-600" 
                                    : "bg-gray-500 text-white"
                                }`}
                              >
                                {log.was_conducted ? "Conducted" : "Not Conducted"}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Show topic preview if available */}
                          {log.topic_covered && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Topic: {log.topic_covered}
                            </p>
                          )}
                          
                          {/* Show notes preview if available */}
                          {log.notes && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Notes: {log.notes}
                            </p>
                          )}
                        </div>
                      )
                    })}
                    
                    {classLogs.length > 10 && (
                      <div className="text-center pt-2">
                        <Badge variant="outline" className="text-xs">
                          {classLogs.length - 10} more logs...
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}