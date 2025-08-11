"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Plus, Clock, Users, BookOpen, MapPin } from "lucide-react"
import { useUserSync } from "../hooks/useUserSync"
import { createClient } from "@supabase/supabase-js"
import { format, isSameDay } from "date-fns"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface ClassSchedule {
  id: string
  tuition_id: string
  tuition_name: string
  subject: string
  day_of_week: string
  start_time: string
  end_time: string
  location?: string
  student_count: number
}

interface ClassLog {
  id: string
  tuition_id: string
  tuition_name: string
  date: string
  start_time: string
  end_time: string
  topic: string
  attendance_count: number
  notes?: string
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [classLogs, setClassLogs] = useState<ClassLog[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUserSync()

  useEffect(() => {
    if (user) {
      fetchSchedules()
      fetchClassLogs()
    }
  }, [user])

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("class_schedules")
        .select(`
          *,
          tuitions!inner(name, subject),
          students!inner(id)
        `)
        .eq("user_id", user?.id)

      if (error) throw error

      const formattedData = (data || []).map((schedule) => ({
        ...schedule,
        tuition_name: schedule.tuitions.name,
        subject: schedule.tuitions.subject,
        student_count: schedule.students?.length || 0,
      }))

      setSchedules(formattedData)
    } catch (error) {
      console.error("Error fetching schedules:", error)
    }
  }

  const fetchClassLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("class_logs")
        .select(`
          *,
          tuitions!inner(name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false })
        .limit(50)

      if (error) throw error

      const formattedData = (data || []).map((log) => ({
        ...log,
        tuition_name: log.tuitions.name,
      }))

      setClassLogs(formattedData)
    } catch (error) {
      console.error("Error fetching class logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSchedulesForDay = (dayName: string) => {
    return schedules.filter((schedule) => schedule.day_of_week === dayName)
  }

  const getClassLogsForDate = (date: Date) => {
    return classLogs.filter((log) => isSameDay(new Date(log.date), date))
  }

  const getTodaySchedules = () => {
    const today = format(new Date(), "EEEE")
    return getSchedulesForDay(today)
  }

  const selectedDaySchedules = getSchedulesForDay(format(selectedDate, "EEEE"))
  const selectedDayLogs = getClassLogsForDate(selectedDate)
  const todaySchedules = getTodaySchedules()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Calendar & Schedule
          </h1>
          <p className="text-muted-foreground mt-1">View your classes and manage schedules</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Today's Overview */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Classes ({todaySchedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySchedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No classes scheduled for today</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySchedules.map((schedule) => (
                <Card key={schedule.id} className="bg-background/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{schedule.tuition_name}</h3>
                      <Badge variant="outline">{schedule.subject}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>{schedule.student_count} students</span>
                      </div>
                      {schedule.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{schedule.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
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

        {/* Selected Day Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled Classes */}
          <Card>
            <CardHeader>
              <CardTitle>
                Classes for {format(selectedDate, "MMMM d, yyyy")} ({selectedDaySchedules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading schedule...</div>
                </div>
              ) : selectedDaySchedules.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No classes scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDaySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {schedule.tuition_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{schedule.tuition_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.subject} • {schedule.start_time} - {schedule.end_time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{schedule.student_count} students</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Logs for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Class Logs for {format(selectedDate, "MMMM d, yyyy")} ({selectedDayLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayLogs.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No class logs recorded for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayLogs.map((log) => (
                    <div key={log.id} className="p-4 border border-border/40 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{log.tuition_name}</h3>
                        <Badge variant="outline">
                          {log.start_time} - {log.end_time}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">Topic: {log.topic}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Attendance: {log.attendance_count} students</span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-2 p-2 bg-accent/20 rounded">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedules = getSchedulesForDay(day)
              return (
                <Card key={day} className="bg-accent/5">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-center">{day}</h3>
                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center">No classes</p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedules.map((schedule) => (
                          <div key={schedule.id} className="p-2 bg-background rounded text-xs">
                            <p className="font-medium truncate">{schedule.tuition_name}</p>
                            <p className="text-muted-foreground">
                              {schedule.start_time} - {schedule.end_time}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
