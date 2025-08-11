"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, FileText } from "lucide-react"
import { useUserSync } from "../hooks/useUserSync"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface ReportData {
  totalStudents: number
  activeStudents: number
  totalTuitions: number
  monthlyRevenue: number
  attendanceRate: number
  paymentRate: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    activeStudents: 0,
    totalTuitions: 0,
    monthlyRevenue: 0,
    attendanceRate: 0,
    paymentRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useUserSync()

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user])

  const fetchReportData = async () => {
    try {
      // Fetch students data
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user?.id)

      if (studentsError) throw studentsError

      // Fetch tuitions data
      const { data: tuitions, error: tuitionsError } = await supabase
        .from("tuitions")
        .select("*")
        .eq("user_id", user?.id)

      if (tuitionsError) throw tuitionsError

      // Fetch payments data
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "paid")

      if (paymentsError) throw paymentsError

      // Calculate report data
      const totalStudents = students?.length || 0
      const activeStudents = students?.filter((s) => s.status === "active").length || 0
      const totalTuitions = tuitions?.length || 0
      const monthlyRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setReportData({
        totalStudents,
        activeStudents,
        totalTuitions,
        monthlyRevenue,
        attendanceRate: 85, // Mock data - would calculate from attendance records
        paymentRate: 92, // Mock data - would calculate from payment records
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const reportCards = [
    {
      title: "Student Overview",
      items: [
        { label: "Total Students", value: reportData.totalStudents, color: "text-blue-600" },
        { label: "Active Students", value: reportData.activeStudents, color: "text-green-600" },
        {
          label: "Inactive Students",
          value: reportData.totalStudents - reportData.activeStudents,
          color: "text-red-600",
        },
      ],
    },
    {
      title: "Financial Summary",
      items: [
        { label: "Monthly Revenue", value: `৳${reportData.monthlyRevenue}`, color: "text-green-600" },
        { label: "Payment Rate", value: `${reportData.paymentRate}%`, color: "text-blue-600" },
        {
          label: "Average Fee per Student",
          value: `৳${Math.round(reportData.monthlyRevenue / (reportData.activeStudents || 1))}`,
          color: "text-violet-600",
        },
      ],
    },
    {
      title: "Performance Metrics",
      items: [
        { label: "Attendance Rate", value: `${reportData.attendanceRate}%`, color: "text-green-600" },
        { label: "Total Tuitions", value: reportData.totalTuitions, color: "text-blue-600" },
        {
          label: "Avg Students per Tuition",
          value: Math.round(reportData.activeStudents / (reportData.totalTuitions || 1)),
          color: "text-violet-600",
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Track your tuition business performance</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">৳{reportData.monthlyRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-violet-600">{reportData.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Rate</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.paymentRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {reportCards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {card.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Calendar className="h-5 w-5" />
              <span>Monthly Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Users className="h-5 w-5" />
              <span>Student Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <DollarSign className="h-5 w-5" />
              <span>Financial Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
