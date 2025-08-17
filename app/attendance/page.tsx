"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, Users, ArrowLeft, BookOpen, CheckCircle2, XCircle, Clock } from "lucide-react"
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

interface Student {
  id: string
  name: string
  class_level: string
}

interface AttendanceRecord {
  student_id: string
  is_present: boolean
}

interface ClassLog {
  id: string
  class_date: string
  was_conducted: boolean
  topic_covered?: string
  notes?: string
}

export default function AttendancePage() {
  const { user, isLoaded } = useUser()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [classLogs, setClassLogs] = useState<ClassLog[]>([])
  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState<{[key: string]: boolean}>({})
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
      fetchStudents()
      fetchClassLogs()
      fetchMonthlyAttendanceData()
    }
  }, [selectedTuition])

  // Add refreshTrigger to dependencies to force re-calculation
  useEffect(() => {
    if (selectedTuition) {
      fetchClassLogs()
      fetchMonthlyAttendanceData()
    }
  }, [selectedTuition, refreshTrigger])

  useEffect(() => {
    if (selectedTuition && selectedDate) {
      fetchAttendanceForDate()
    }
  }, [selectedTuition, selectedDate])

  // Fetch monthly attendance data for calendar coloring
  useEffect(() => {
    if (selectedTuition && selectedDate) {
      fetchMonthlyAttendanceData()
    }
  }, [selectedTuition, selectedDate, refreshTrigger])

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

  const fetchStudents = async () => {
    if (!selectedTuition) return

    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, class_level")
        .eq("tuition_id", selectedTuition.id)
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error fetching students:", error)
        toast.error("Failed to fetch students")
        return
      }
      
      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch students")
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
        .limit(50)

      if (error) {
        console.error("Error fetching class logs:", error)
        return
      }
      
      setClassLogs(data || [])
    } catch (error) {
      console.error("Error fetching class logs:", error)
    }
  }

  const fetchMonthlyAttendanceData = async () => {
    if (!selectedTuition || !selectedDate) return

    try {
      const monthStart = startOfMonth(selectedDate)
      const monthEnd = endOfMonth(selectedDate)
      
      const { data, error } = await supabase
        .from("attendance")
        .select("date, is_present")
        .eq("tuition_id", selectedTuition.id)
        .gte("date", format(monthStart, "yyyy-MM-dd"))
        .lte("date", format(monthEnd, "yyyy-MM-dd"))

      if (error) {
        console.error("Error fetching monthly attendance:", error)
        return
      }

      // Group by date and check if any student was present on each date
      const dateMap: {[key: string]: boolean} = {}
      
      if (data) {
        data.forEach(record => {
          const dateStr = record.date
          if (!dateMap[dateStr]) {
            dateMap[dateStr] = false
          }
          // If any student was present, mark the date as conducted
          if (record.is_present) {
            dateMap[dateStr] = true
          }
        })
      }
      
      setMonthlyAttendanceData(dateMap)
    } catch (error) {
      console.error("Error fetching monthly attendance data:", error)
    }
  }

  const fetchAttendanceForDate = async () => {
    if (!selectedTuition || !selectedDate) return

    try {
      setAttendanceLoading(true)
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, is_present")
        .eq("tuition_id", selectedTuition.id)
        .eq("date", dateStr)

      if (error) {
        console.error("Error fetching attendance:", error)
        toast.error("Failed to fetch attendance data")
        return
      }
      
      setAttendanceRecords(data || [])
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast.error("Failed to fetch attendance data")
    } finally {
      setAttendanceLoading(false)
    }
  }

  const createOrUpdateClassLog = async (dateStr: string, wasConducted: boolean) => {
    try {
      // Check if class log exists
      const { data: existingLog } = await supabase
        .from("class_logs")
        .select("id")
        .eq("tuition_id", selectedTuition?.id)
        .eq("class_date", dateStr)
        .maybeSingle()

      if (existingLog) {
        // Update existing log
        await supabase
          .from("class_logs")
          .update({ was_conducted: wasConducted })
          .eq("id", existingLog.id)
      } else {
        // Create new log
        await supabase
          .from("class_logs")
          .insert({
            tuition_id: selectedTuition?.id,
            class_date: dateStr,
            was_conducted: wasConducted,
            created_at: new Date().toISOString(),
          })
      }
    } catch (error) {
      console.error("Error updating class log:", error)
    }
  }

  const handleAttendanceChange = async (studentId: string, isPresent: boolean) => {
    if (!selectedTuition || !selectedDate) return

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")

      // Check if attendance record already exists
      const { data: existingRecord } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", studentId)
        .eq("tuition_id", selectedTuition.id)
        .eq("date", dateStr)
        .maybeSingle()

      let result
      
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from("attendance")
          .update({
            is_present: isPresent,
          })
          .eq("id", existingRecord.id)
      } else {
        // Insert new record
        result = await supabase
          .from("attendance")
          .insert({
            student_id: studentId,
            tuition_id: selectedTuition.id,
            date: dateStr,
            is_present: isPresent,
            created_at: new Date().toISOString(),
          })
      }

      if (result.error) {
        console.error("Error updating attendance:", result.error)
        toast.error("Failed to update attendance")
        return
      }

      // Update local state
      setAttendanceRecords((prev) => {
        const existing = prev.find((r) => r.student_id === studentId)
        if (existing) {
          return prev.map((r) => (r.student_id === studentId ? { ...r, is_present: isPresent } : r))
        } else {
          return [...prev, { student_id: studentId, is_present: isPresent }]
        }
      })

      // After updating attendance, check if any student is present to mark class as conducted
      const updatedRecords = await supabase
        .from("attendance")
        .select("is_present")
        .eq("tuition_id", selectedTuition.id)
        .eq("date", dateStr)

      const hasAnyPresent = updatedRecords.data?.some(record => record.is_present) || false
      
      // Update class log based on attendance
      await createOrUpdateClassLog(dateStr, hasAnyPresent)

      // Refresh monthly attendance data and class logs to show updated status
      await fetchClassLogs()
      await fetchMonthlyAttendanceData()
      forceRefresh() // Force component re-render to update calendar colors
      
      toast.success("Attendance updated successfully")
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast.error("Failed to update attendance")
    }
  }

  const markAllPresent = async () => {
    if (!selectedTuition || !selectedDate || students.length === 0) return

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      
      // Mark all students as present
      const attendanceData = students.map(student => ({
        student_id: student.id,
        tuition_id: selectedTuition.id,
        date: dateStr,
        is_present: true,
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from("attendance")
        .upsert(attendanceData, {
          onConflict: "student_id,tuition_id,date"
        })

      if (error) {
        console.error("Error marking all present:", error)
        toast.error("Failed to mark all students present")
        return
      }

      // Update local state
      setAttendanceRecords(students.map(student => ({
        student_id: student.id,
        is_present: true
      })))

      // Mark class as conducted
      await createOrUpdateClassLog(dateStr, true)
      await fetchClassLogs()
      await fetchMonthlyAttendanceData()
      forceRefresh() // Update calendar colors
      toast.success("All students marked present!")
    } catch (error) {
      console.error("Error marking all present:", error)
      toast.error("Failed to mark all students present")
    }
  }

  const markAllAbsent = async () => {
    if (!selectedTuition || !selectedDate || students.length === 0) return

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      
      // Mark all students as absent
      const attendanceData = students.map(student => ({
        student_id: student.id,
        tuition_id: selectedTuition.id,
        date: dateStr,
        is_present: false,
        created_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from("attendance")
        .upsert(attendanceData, {
          onConflict: "student_id,tuition_id,date"
        })

      if (error) {
        console.error("Error marking all absent:", error)
        toast.error("Failed to mark all students absent")
        return
      }

      // Update local state
      setAttendanceRecords(students.map(student => ({
        student_id: student.id,
        is_present: false
      })))

      // Mark class as not conducted
      await createOrUpdateClassLog(dateStr, false)
      await fetchClassLogs()
      await fetchMonthlyAttendanceData()
      forceRefresh() // Update calendar colors
      toast.success("All students marked absent")
    } catch (error) {
      console.error("Error marking all absent:", error)
      toast.error("Failed to mark all students absent")
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

  // Check if class was conducted for a date (based on attendance data)
  const wasClassConducted = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd")
    return monthlyAttendanceData[dateStr] === true
  }

  // Get class status for a date
  const getDateClassStatus = (date: Date): 'scheduled' | 'conducted' | 'missed' | 'none' => {
    const isScheduled = isScheduledClassDay(date)
    const wasConducted = wasClassConducted(date)
    
    if (wasConducted) return 'conducted'
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
    const missedDays: Date[] = []
    
    daysInMonth.forEach(date => {
      const status = getDateClassStatus(date)
      if (status === 'scheduled') scheduledDays.push(date)
      else if (status === 'conducted') conductedDays.push(date)
      else if (status === 'missed') missedDays.push(date)
    })
    
    return {
      scheduled: scheduledDays,
      conducted: conductedDays,
      missed: missedDays
    }
  }

  const dayModifiers = getDayModifiers()

  const getAttendanceStats = () => {
    const total = students.length
    const present = attendanceRecords.filter((r) => r.is_present).length
    const absent = total - present
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { total, present, absent, percentage }
  }

  const getClassStatus = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    // Check attendance data instead of class logs
    return monthlyAttendanceData[dateStr] === true
  }

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
    const missedClasses = scheduledDays.filter(date => 
      !wasClassConducted(date) && isPast(date) && !isToday(date)
    )
    
    return {
      scheduled: scheduledDays.length,
      conducted: conductedClasses.length,
      missed: missedClasses.length,
      remaining: scheduledDays.filter(date => isFuture(date) || isToday(date)).length
    }
  }

  const stats = getAttendanceStats()
  const classWasConducted = getClassStatus()
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
                  Attendance
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">Select a tuition to take attendance</p>
              </div>
            </div>
          </div>

          {/* Tuitions List */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Tuition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tuitions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-violet-500" />
                  </div>
                  <h3 className="font-medium mb-2 text-lg">No active tuitions</h3>
                  <p className="text-muted-foreground mb-6">Create a tuition first to take attendance</p>
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
                            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
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
                          Take Attendance
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

  // Show attendance interface for selected tuition
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedTuition(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent truncate">
                {selectedTuition.name}
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg truncate">
                {selectedTuition.subject} • {selectedTuition.teaching_days?.join(", ")}
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
  <div className="bg-orange-50 dark:bg-orange-950/20 px-3 py-2 rounded-md text-center text-xs hover:shadow-sm transition">
    <p className="text-[10px] text-muted-foreground">Scheduled</p>
    <p className="text-sm font-semibold text-orange-600">{monthlyStats.scheduled}</p>
  </div>
  <div className="bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-md text-center text-xs hover:shadow-sm transition">
    <p className="text-[10px] text-muted-foreground">Conducted</p>
    <p className="text-sm font-semibold text-green-600">{monthlyStats.conducted}</p>
  </div>
  <div className="bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md text-center text-xs hover:shadow-sm transition">
    <p className="text-[10px] text-muted-foreground">Missed</p>
    <p className="text-sm font-semibold text-red-600">{monthlyStats.missed}</p>
  </div>
  <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-2 rounded-md text-center text-xs hover:shadow-sm transition">
    <p className="text-[10px] text-muted-foreground">Remaining</p>
    <p className="text-sm font-semibold text-blue-600">{monthlyStats.remaining}</p>
  </div>
</div>
              {/* <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="text-lg font-bold text-orange-600">{monthlyStats.scheduled}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Conducted</p>
                  <p className="text-lg font-bold text-green-600">{monthlyStats.conducted}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-2 md:p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Missed</p>
                  <p className="text-lg font-bold text-red-600">{monthlyStats.missed}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 md:p-1 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold text-blue-600">{monthlyStats.remaining}</p>
                </div>
              </div> */}

              {/* Legend */}
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-orange-500/20 border-2 border-orange-500 flex-shrink-0"></div>
                  <span>Scheduled classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500/20 border-2 border-green-500 flex-shrink-0"></div>
                  <span>Completed classes</span>
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
                    missed: { 
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgb(239, 68, 68)',
                      borderRadius: '50%'
                    }
                  }}
                  disabled={(date) => isFuture(date)}
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
              </div>

              {/* Class Status for Selected Date */}
              <div className="text-center p-3 md:p-4 rounded-lg border">
                {isScheduledClassDay(selectedDate) ? (
                  classWasConducted ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">Class Conducted</span>
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

              {/* Today's Stats (if taking attendance) */}
              
            </CardContent>
          </Card>

          {/* Student Attendance List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
            {dateStatus !== "future" && attendanceRecords.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-3 md:p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.percentage}%</p>
                    <p className="text-xs text-muted-foreground">{stats.present} of {stats.total} present</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 md:p-3 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Present</p>
                      <p className="text-lg font-bold text-green-600">{stats.present}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 p-2 md:p-3 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Absent</p>
                      <p className="text-lg font-bold text-red-600">{stats.absent}</p>
                    </div>
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg md:text-xl">
                    Student Attendance - {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                  {dateStatus !== "future" && students.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllPresent}
                        className="text-green-600 hover:bg-green-50 border-green-200 flex-1 sm:flex-none"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAbsent}
                        className="text-red-600 hover:bg-red-50 border-red-200 flex-1 sm:flex-none"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        All Absent
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {dateStatus === "future" ? (
                  <div className="text-center py-12">
                    <Clock className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cannot take attendance for future dates</p>
                  </div>
                ) : attendanceLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading attendance...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No students found in this tuition</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => {
                      const attendance = attendanceRecords.find((r) => r.student_id === student.id)
                      const isPresent = attendance?.is_present || false

                      return (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between p-3 md:p-4 border rounded-lg transition-all duration-200 ${
                            isPresent 
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                              : "bg-background border-border/40 hover:bg-accent/20"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0 ${
                              isPresent 
                                ? "bg-gradient-to-br from-green-500 to-green-600" 
                                : "bg-gradient-to-br from-gray-400 to-gray-500"
                            }`}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{student.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{student.class_level}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                            <Badge
                              variant={isPresent ? "default" : "destructive"}
                              className={`min-w-[60px] md:min-w-[70px] justify-center text-xs ${
                                isPresent ? "bg-green-500 hover:bg-green-600" : ""
                              }`}
                            >
                              {isPresent ? "Present" : "Absent"}
                            </Badge>

                            <Checkbox
                              id={`attendance-${student.id}`}
                              checked={isPresent}
                              onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Classes Summary */}
            {classLogs.length > 0 && (
              <Card className="mt-6 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {classLogs.slice(0, 8).map((log) => {
                      const logDate = new Date(log.class_date)
                      const wasScheduled = isScheduledClassDay(logDate)
                      
                      return (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded border">
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
                                  : "bg-red-500 hover:bg-red-600 text-white"
                              }`}
                            >
                              {log.was_conducted ? "Conducted" : "Missed"}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
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


