"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Search, CheckCircle, XCircle, Clock, ArrowLeft, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

interface FeeRecord {
  id: string
  student_id: string
  student_name: string
  tuition_name: string
  amount: number
  month: string
  year: number
  status: "paid" | "due" | "partial"
  paid_date?: string
  additional_notes?: string
  created_at: string
}

interface FeeStats {
  totalRecords: number
  totalPaid: number
  totalDue: number
  totalPartial: number
  totalRevenue: number
  totalOutstanding: number
}

export default function FeesPage() {
  const { user, isLoaded } = useUser()
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<FeeRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  useEffect(() => {
    if (isLoaded && user) {
      getCurrentUserId()
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (currentUserId) {
      fetchFeeRecords()
    }
  }, [currentUserId])

  useEffect(() => {
    let filtered = feeRecords

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.tuition_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter)
    }

    if (monthFilter !== "all") {
      filtered = filtered.filter((record) => record.month === monthFilter)
    }

    if (yearFilter !== "all") {
      filtered = filtered.filter((record) => record.year === Number.parseInt(yearFilter))
    }

    setFilteredRecords(filtered)
  }, [feeRecords, searchTerm, statusFilter, monthFilter, yearFilter])

  const getCurrentUserId = async () => {
    try {
      const { data: userData, error } = await supabase.from("users").select("id").eq("clerk_id", user?.id).single()

      if (error) {
        console.error("Error fetching user:", error)
        return
      }

      setCurrentUserId(userData.id)
    } catch (error) {
      console.error("Error getting current user ID:", error)
    }
  }

  const fetchFeeRecords = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("fee_records")
        .select(`
          id,
          student_id,
          amount,
          month,
          year,
          status,
          paid_date,
          additional_notes,
          created_at,
          students!inner(
            name,
            tuitions!inner(
              name,
              tutor_id
            )
          )
        `)
        .eq("students.tuitions.tutor_id", currentUserId)
        .order("year", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedData: FeeRecord[] =
        data?.map((record) => ({
          id: record.id,
          student_id: record.student_id,
          student_name: record.students.name,
          tuition_name: record.students.tuitions.name,
          amount: record.amount,
          month: record.month,
          year: record.year,
          status: record.status as "paid" | "due" | "partial",
          paid_date: record.paid_date,
          additional_notes: record.additional_notes,
          created_at: record.created_at,
        })) || []

      setFeeRecords(formattedData)
    } catch (error) {
      console.error("Error fetching fee records:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("fee_records")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", recordId)

      if (error) throw error

      toast.success("Payment marked as paid!")
      fetchFeeRecords()
    } catch (error) {
      console.error("Error updating payment:", error)
      toast.error("Failed to update payment status")
    }
  }

  const getFeeStats = (): FeeStats => {
    const totalRecords = feeRecords.length
    const totalPaid = feeRecords.filter((r) => r.status === "paid").length
    const totalDue = feeRecords.filter((r) => r.status === "due").length
    const totalPartial = feeRecords.filter((r) => r.status === "partial").length
    const totalRevenue = feeRecords.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount, 0)
    const totalOutstanding = feeRecords.filter((r) => r.status === "due").reduce((sum, r) => sum + r.amount, 0)

    return { totalRecords, totalPaid, totalDue, totalPartial, totalRevenue, totalOutstanding }
  }

  const stats = getFeeStats()

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Fee Management
              </h1>
              <p className="text-muted-foreground text-lg">Track payments and manage student fees</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPaid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalDue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Partial</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.totalPartial}</p>
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
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-violet-600">৳{stats.totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">৳{stats.totalOutstanding}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setMonthFilter("all")
                  setYearFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fee Records List */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Records ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-medium mb-2 text-lg">
                  {searchTerm || statusFilter !== "all" || monthFilter !== "all" || yearFilter !== "all"
                    ? "No fee records found"
                    : "No fee records yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all" || monthFilter !== "all" || yearFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Fee records will appear here as you manage student payments"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {record.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{record.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.tuition_name} • {record.month} {record.year}
                        </p>
                        {record.additional_notes && (
                          <p className="text-xs text-muted-foreground mt-1">{record.additional_notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">৳{record.amount}</p>
                        <Badge
                          variant={
                            record.status === "paid"
                              ? "default"
                              : record.status === "partial"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {record.status}
                        </Badge>
                        {record.paid_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid: {format(new Date(record.paid_date), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>

                      {record.status !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() => markAsPaid(record.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
