"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { useUserSync } from "../hooks/useUserSync"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface AttendanceRecord {
  id: string
  student_id: string
  student_name: string
  date: string
  status: "present" | "absent" | "late"
  notes?: string
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUserSync()

  useEffect(() => {
    if (user) {
      fetchStudents()
      fetchAttendance()
    }
  }, [user, selectedDate])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*").eq("user_id", user?.id).eq("status", "active")

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchAttendance = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          students!inner(name)
        `)
        .eq("user_id", user?.id)
        .eq("date", dateStr)

      if (error) throw error

      const formattedData = (data || []).map((record) => ({
        ...record,
        student_name: record.students.name,
      }))

      setAttendanceRecords(formattedData)
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (studentId: string, status: "present" | "absent" | "late") => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")

      const { error } = await supabase.from("attendance").upsert(
        {
          user_id: user?.id,
          student_id: studentId,
          date: dateStr,
          status: status,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,student_id,date",
        },
      )

      if (error) throw error
      fetchAttendance()
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const getAttendanceStats = () => {
    const total = attendanceRecords.length
    const present = attendanceRecords.filter((r) => r.status === "present").length
    const absent = attendanceRecords.filter((r) => r.status === "absent").length
    const late = attendanceRecords.filter((r) => r.status === "late").length

    return { total, present, absent, late }
  }

  const stats = getAttendanceStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Attendance
        </h1>
        <p className="text-muted-foreground mt-1">Track student attendance and monitor patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Attendance for Selected Date */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-blue-600">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-xl font-bold text-green-600">{stats.present}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Late</p>
                    <p className="text-xl font-bold text-orange-600">{stats.late}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading attendance...</div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active students found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => {
                    const attendance = attendanceRecords.find((r) => r.student_id === student.id)

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.subject} - {student.class_level}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {attendance && (
                            <Badge
                              variant={
                                attendance.status === "present"
                                  ? "default"
                                  : attendance.status === "late"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="mr-2"
                            >
                              {attendance.status}
                            </Badge>
                          )}

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={attendance?.status === "present" ? "default" : "outline"}
                              onClick={() => markAttendance(student.id, "present")}
                              className="h-8 px-3"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "late" ? "secondary" : "outline"}
                              onClick={() => markAttendance(student.id, "late")}
                              className="h-8 px-3"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance?.status === "absent" ? "destructive" : "outline"}
                              onClick={() => markAttendance(student.id, "absent")}
                              className="h-8 px-3"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
