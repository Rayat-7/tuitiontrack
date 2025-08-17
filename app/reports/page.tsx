"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, FileText, Clock } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

interface ReportData {
  totalStudents: number
  activeStudents: number
  totalTuitions: number
  monthlyRevenue: number
  attendanceRate: number
  paymentRate: number
  totalFeeRecords: number
  paidAmount: number
  dueAmount: number
}

export default function ReportsPage() {
  const { user, isLoaded } = useUser()
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    activeStudents: 0,
    totalTuitions: 0,
    monthlyRevenue: 0,
    attendanceRate: 0,
    paymentRate: 0,
    totalFeeRecords: 0,
    paidAmount: 0,
    dueAmount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchReportData()
    }
  }, [isLoaded, user])

  const fetchReportData = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user?.id)
        .single()

      if (userError || !userData) {
        setLoading(false)
        return
      }

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*, tuitions!inner(tutor_id)")
        .eq("tuitions.tutor_id", userData.id)

      const { data: tuitions, error: tuitionsError } = await supabase
        .from("tuitions")
        .select("*")
        .eq("tutor_id", userData.id)

      const { data: feeRecords, error: feeError } = await supabase
        .from("fee_records")
        .select("*, students!inner(*, tuitions!inner(tutor_id))")
        .eq("students.tuitions.tutor_id", userData.id)

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*, students!inner(*, tuitions!inner(tutor_id))")
        .eq("students.tuitions.tutor_id", userData.id)

      if (studentsError || tuitionsError || feeError) {
        console.error("Error fetching data:", { studentsError, tuitionsError, feeError })
        setLoading(false)
        return
      }

      const totalStudents = students?.length || 0
      const activeStudents = students?.filter((s) => s.status === "active").length || 0
      const totalTuitions = tuitions?.length || 0

      const paidRecords = feeRecords?.filter((f) => f.status === "paid") || []
      const dueRecords = feeRecords?.filter((f) => f.status === "due") || []

      const paidAmount = paidRecords.reduce((sum, f) => sum + (f.amount || 0), 0)
      const dueAmount = dueRecords.reduce((sum, f) => sum + (f.amount || 0), 0)
      const monthlyRevenue = paidAmount

      const totalAttendanceRecords = attendanceData?.length || 0
      const presentRecords = attendanceData?.filter((a) => a.status === "present").length || 0
      const attendanceRate =
        totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 0

      const totalFeeRecords = feeRecords?.length || 0
      const paymentRate = totalFeeRecords > 0 ? Math.round((paidRecords.length / totalFeeRecords) * 100) : 0

      setReportData({
        totalStudents,
        activeStudents,
        totalTuitions,
        monthlyRevenue,
        attendanceRate,
        paymentRate,
        totalFeeRecords,
        paidAmount,
        dueAmount,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="space-y-8 p-4 md:p-8 pt-16 md:pt-8">
      {/* Header with creative date/time */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedDate}
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <Clock className="h-3 w-3 mr-1" />
              {formattedTime}
            </Badge>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <Users className="h-3 w-3 mr-1" />
          {reportData.totalStudents} Students
        </Badge>
        <Badge className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <DollarSign className="h-3 w-3 mr-1" />৳{reportData.monthlyRevenue} Revenue
        </Badge>
        <Badge className="px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <TrendingUp className="h-3 w-3 mr-1" />
          {reportData.attendanceRate}% Attendance
        </Badge>
        <Badge className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <BarChart3 className="h-3 w-3 mr-1" />
          {reportData.paymentRate}% Payment Rate
        </Badge>
        <Badge className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
          <FileText className="h-3 w-3 mr-1" />
          {reportData.totalTuitions} Tuitions
        </Badge>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users className="h-5 w-5" />
              Student Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Students</span>
                  <span className="font-semibold text-blue-600">{reportData.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <span className="font-semibold text-green-600">{reportData.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Inactive Students</span>
                  <span className="font-semibold text-red-600">
                    {reportData.totalStudents - reportData.activeStudents}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold text-green-600">৳{reportData.paidAmount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Outstanding Dues</span>
                  <span className="font-semibold text-red-600">৳{reportData.dueAmount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Payment Rate</span>
                  <span className="font-semibold text-blue-600">{reportData.paymentRate}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span className="font-semibold text-green-600">{reportData.attendanceRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Tuitions</span>
                  <span className="font-semibold text-blue-600">{reportData.totalTuitions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Avg Students/Tuition</span>
                  <span className="font-semibold text-violet-600">
                    {Math.round(reportData.activeStudents / (reportData.totalTuitions || 1))}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-background to-accent/5 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200"
            >
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700">Monthly Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
            >
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-green-700">Student Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200"
            >
              <DollarSign className="h-5 w-5 text-violet-600" />
              <span className="text-violet-700">Financial Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-2 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-orange-200"
            >
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span className="text-orange-700">Performance Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
