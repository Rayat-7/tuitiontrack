// app/tuitions/[id]/page.tsx - Updated with proper Supabase auth
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import {
  ArrowLeft,
  BookOpen,
  Users,
  CalendarIcon,
  DollarSign,
  Settings,
  Plus,
  Edit,
  CalendarPlus,
  Receipt,
  Phone,
  GraduationCap,
  Trash2,
  Archive,
  MapPin,
  Save,
  X,
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"
import { toast } from "sonner"
import AddStudentModal from "@/components/AddStudentModal"
import EditStudentModal from "@/components/EditStudentModal"
import { EditTuitionModal } from "@/components/EditTuitionModal"
import EditClassLogModal from "@/components/EditClassLogModal"

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

type TuitionDetails = {
  id: string
  name: string
  subject: string
  description?: string
  address?: string
  teaching_days?: string[]
  days_per_week?: number
  status: "active" | "archived"
  created_at: string
  updated_at: string
}

type TuitionStats = {
  totalStudents: number
  attendanceRate: number
  unpaidFees: number
  recentClasses: number
}

type Student = {
  id: string
  name: string
  phone?: string
  parent_phone?: string
  class_level: string
  fee_per_month: number
  status?: string
  created_at: string
}

type ClassLog = {
  id: string
  class_date: string
  was_conducted: boolean
  topic_covered?: string
  notes?: string
  attendance_data?: any
  selectedDate?: any
}

type FeeRecord = {
  id: string
  student_id: string
  student_name: string
  month: string
  year: number
  amount: number
  status: string
  additional_notes?: string
  paid_date?: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

export default function TuitionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const supabase = useAuthenticatedSupabase()
  const tuitionId = params.id as string

  const [tuition, setTuition] = useState<TuitionDetails | null>(null)
  const [stats, setStats] = useState<TuitionStats>({
    totalStudents: 0,
    attendanceRate: 0,
    unpaidFees: 0,
    recentClasses: 0,
  })
  const [students, setStudents] = useState<Student[]>([])
  const [classLogs, setClassLogs] = useState<ClassLog[]>([])
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("students")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showAddClassLog, setShowAddClassLog] = useState(false)
  const [classLogForm, setClassLogForm] = useState({
    topic_covered: "",
    notes: "",
    was_conducted: true,
  })

  useEffect(() => {
    if (isLoaded && user && tuitionId) {
      fetchTuitionDetails()
    }
  }, [isLoaded, user, tuitionId])

  const fetchTuitionDetails = async () => {
    try {
      setLoading(true)

      // Fetch tuition details - RLS will automatically filter to user's tuitions
      const { data: tuitionData, error: tuitionError } = await supabase
        .from("tuitions")
        .select("*")
        .eq("id", tuitionId)
        .single()

      if (tuitionError) {
        console.error("Error fetching tuition:", tuitionError)
        toast.error("Tuition not found or access denied")
        router.push("/tuitions")
        return
      }

      if (!tuitionData) {
        toast.error("Tuition not found")
        router.push("/tuitions")
        return
      }

      setTuition(tuitionData)

      // Fetch active students - RLS will automatically filter
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("tuition_id", tuitionId)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (studentsError) {
        console.error("Error fetching students:", studentsError)
        toast.error("Error loading students")
      } else {
        setStudents(studentsData || [])
      }

      // Fetch class logs - RLS will automatically filter
      const { data: classLogsData, error: classLogsError } = await supabase
        .from("class_logs")
        .select("*")
        .eq("tuition_id", tuitionId)
        .order("class_date", { ascending: false })

      if (classLogsError) {
        console.error("Error fetching class logs:", classLogsError)
        toast.error("Error loading class logs")
      } else {
        setClassLogs(classLogsData || [])
      }

      // Calculate stats
      const totalStudents = studentsData?.length || 0
      const conductedClasses = classLogsData?.filter((log) => log.was_conducted).length || 0
      const totalScheduledClasses = classLogsData?.length || 0
      const attendanceRate =
        totalScheduledClasses > 0 ? Math.round((conductedClasses / totalScheduledClasses) * 100) : 0

      setStats({
        totalStudents,
        attendanceRate,
        unpaidFees: 0, // Will be calculated when we fetch fee records
        recentClasses: conductedClasses,
      })
    } catch (error) {
      console.error("Error fetching tuition details:", error)
      toast.error("Failed to load tuition details")
    } finally {
      setLoading(false)
    }
  }

  const fetchFeeRecords = async () => {
    try {
      if (students.length === 0) return

      const studentIds = students.map((s) => s.id)

      // Create fee records for students who don't have them for this month/year
      for (const student of students) {
        const { error: upsertError } = await supabase
          .from("fee_records")
          .upsert(
            {
              student_id: student.id,
              tuition_id: tuitionId,
              month: MONTHS[selectedMonth],
              year: selectedYear,
              amount: student.fee_per_month,
              status: "due",
            },
            {
              onConflict: "student_id,month,year",
              ignoreDuplicates: true,
            }
          )

        if (upsertError) {
          console.error("Error upserting fee record:", upsertError)
        }
      }

      // Fetch fee records with student names
      const { data: feeData, error: feeError } = await supabase
        .from("fee_records")
        .select(`
          *,
          students!inner(name)
        `)
        .in("student_id", studentIds)
        .eq("month", MONTHS[selectedMonth])
        .eq("year", selectedYear)

      if (feeError) {
        console.error("Error fetching fee records:", feeError)
        toast.error("Error loading fee records")
        return
      }

      const formattedFeeRecords = feeData?.map((record: any) => ({
        ...record,
        student_name: record.students.name,
      })) || []

      setFeeRecords(formattedFeeRecords)

      // Update unpaid fees count
      const unpaidCount = formattedFeeRecords.filter(record => 
        record.status === "due" || record.status === "partial"
      ).length

      setStats(prev => ({ ...prev, unpaidFees: unpaidCount }))
    } catch (error) {
      console.error("Error in fetchFeeRecords:", error)
      toast.error("Failed to load fee records")
    }
  }

  useEffect(() => {
    if (tuitionId && activeTab === "payments" && students.length > 0) {
      fetchFeeRecords()
    }
  }, [tuitionId, selectedMonth, selectedYear, activeTab, students])

  const markPaymentAsPaid = async (feeRecordId: string) => {
    try {
      const { error } = await supabase
        .from("fee_records")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split('T')[0],
        })
        .eq("id", feeRecordId)

      if (error) {
        console.error("Error updating payment:", error)
        toast.error("Failed to update payment")
        return
      }

      toast.success("Payment marked as paid")
      fetchFeeRecords()
    } catch (error) {
      console.error("Error updating payment:", error)
      toast.error("Failed to update payment")
    }
  }

  const addClassLog = async () => {
    try {
      if (!selectedDate) {
        toast.error("Please select a date")
        return
      }

      const classDate = selectedDate.toISOString().split("T")[0]
      const topic = classLogForm.topic_covered.trim() || "Class conducted"
      const notes = classLogForm.notes.trim() || ""

      const { error } = await supabase.from("class_logs").insert({
        tuition_id: tuitionId,
        class_date: classDate,
        topic_covered: topic,
        notes: notes,
        was_conducted: classLogForm.was_conducted,
      })

      if (error) {
        console.error("Error adding class log:", error)
        toast.error("Failed to add class log")
        return
      }

      toast.success("Class log added successfully")
      setShowAddClassLog(false)
      setClassLogForm({ topic_covered: "", notes: "", was_conducted: true })
      fetchTuitionDetails()
    } catch (error) {
      console.error("Error adding class log:", error)
      toast.error("Failed to add class log")
    }
  }

  const archiveTuition = async () => {
    try {
      if (!confirm("Are you sure you want to archive this tuition? It can be restored later.")) {
        return
      }

      const { error } = await supabase
        .from("tuitions")
        .update({
          status: "archived",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tuitionId)

      if (error) {
        console.error("Error archiving tuition:", error)
        toast.error("Failed to archive tuition")
        return
      }

      toast.success("Tuition archived successfully")
      router.push("/tuitions")
    } catch (error) {
      console.error("Error archiving tuition:", error)
      toast.error("Failed to archive tuition")
    }
  }

  const archiveStudent = async (studentId: string, studentName: string) => {
    if (
      !confirm(
        `Are you sure you want to archive ${studentName}? They will be moved to the archive and can be restored later.`
      )
    ) {
      return
    }

    try {
      const { error } = await supabase
        .from("students")
        .update({ status: "archived" })
        .eq("id", studentId)

      if (error) {
        console.error("Error archiving student:", error)
        toast.error("Failed to archive student")
        return
      }

      toast.success(`${studentName} has been archived`)
      fetchTuitionDetails()
    } catch (error) {
      console.error("Error archiving student:", error)
      toast.error("Failed to archive student")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`
  }

  const getTeachingDaysDisplay = (days?: string[]) => {
    if (!days || days.length === 0) return "Not set"
    return days.map((dayId) => DAYS_OF_WEEK.find((d) => d.id === dayId)?.short || dayId).join(", ")
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/3"></div>
          <div className="flex gap-3 justify-end">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 w-32 bg-gradient-to-br from-muted to-muted/50 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gradient-to-br from-muted to-muted/50 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!tuition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Tuition not found</h2>
          <p className="text-muted-foreground mb-4">
            The tuition you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/tuitions">
            <Button className="bg-gradient-to-r from-primary to-primary/80">Back to Tuitions</Button>
          </Link>
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
            <Link href="/tuitions">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm border shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {tuition.name}
                </h1>
                <Badge
                  variant={
                    tuition.status === "active" ? "default" : "secondary"
                  }
                  className={
                    tuition.status === "active"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : ""
                  }
                >
                  {tuition.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{tuition.subject}</p>
              {tuition.address && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {tuition.address}
                </p>
              )}
              {tuition.teaching_days && tuition.teaching_days.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {tuition.days_per_week} days/week:{" "}
                  {getTeachingDaysDisplay(tuition.teaching_days)}
                </p>
              )}
              {tuition.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {tuition.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="flex flex-wrap gap-3 mb-8 justify-end">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 min-w-[140px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {stats.totalStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                  <Users className="h-3 w-3 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 min-w-[140px]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {stats.attendanceRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <CalendarIcon className="h-3 w-3 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 min-w-[140px]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {stats.unpaidFees}
                  </div>
                  <p className="text-xs text-muted-foreground">Unpaid</p>
                </div>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 min-w-[140px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {stats.recentClasses}
                  </div>
                  <p className="text-xs text-muted-foreground">Classes</p>
                </div>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
                  <BookOpen className="h-3 w-3 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-gradient-to-r from-background to-accent/10 border border-border/50">
            <TabsTrigger
              value="students"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            >
              <Users className="h-4 w-4" />
              Students ({stats.totalStudents})
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            >
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Students</CardTitle>
                <AddStudentModal
                  tuitionId={tuitionId}
                  onStudentAdded={fetchTuitionDetails}
                />
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-6 border rounded-xl hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/10 transition-all duration-200 hover:scale-[1.01] hover:shadow-md bg-gradient-to-br from-background to-accent/5"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">
                              {student.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
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
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
                          >
                            Active
                          </Badge>
                          <EditStudentModal
                            student={student}
                            onStudentUpdated={fetchTuitionDetails}
                          />
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-blue-500/10 hover:text-blue-600"
                            onClick={() => {
                              toast.info("Edit student functionality coming soon")
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-500/10 hover:text-red-600"
                            onClick={() =>
                              archiveStudent(student.id, student.name)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-medium mb-2 text-lg">
                      No students yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Add your first student to get started
                    </p>
                    <AddStudentModal
                      tuitionId={tuitionId}
                      onStudentAdded={fetchTuitionDetails}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
      <CardHeader>
        <CardTitle className="text-lg">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border-0"
          modifiers={{
            classDay: classLogs
              .filter((log) => log.was_conducted)
              .map((log) => new Date(log.class_date)),
          }}
          modifiersStyles={{
            classDay: {
              backgroundColor: "rgb(34 197 94)",
              color: "white",
              fontWeight: "bold",
            },
          }}
        />
        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Class conducted</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          Class Log -{" "}
          {selectedDate?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </CardTitle>
        {(() => {
          const existingLog = selectedDate 
            ? classLogs.find(
                (log) =>
                  new Date(log.class_date).toDateString() ===
                  selectedDate.toDateString()
              )
            : null;

          return existingLog ? (
            <EditClassLogModal
              classLog={existingLog}
              onClassLogUpdated={fetchTuitionDetails}
              onClassLogDeleted={fetchTuitionDetails}
            />
          ) : (
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              onClick={() => setShowAddClassLog(true)}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add Class Log
            </Button>
          );
        })()}
      </CardHeader>
      <CardContent>
        {showAddClassLog && (
          <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="was_conducted"
                  checked={classLogForm.was_conducted}
                  onCheckedChange={(checked) =>
                    setClassLogForm((prev) => ({
                      ...prev,
                      was_conducted: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="was_conducted">
                  Class was conducted
                </Label>
              </div>
              <div>
                <Label htmlFor="topic">Topic Covered</Label>
                <Input
                  id="topic"
                  value={classLogForm.topic_covered}
                  onChange={(e) =>
                    setClassLogForm((prev) => ({
                      ...prev,
                      topic_covered: e.target.value,
                    }))
                  }
                  placeholder="What topic was covered in this class?"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={classLogForm.notes}
                  onChange={(e) =>
                    setClassLogForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any additional notes about the class..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addClassLog}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Class Log
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddClassLog(false);
                    setClassLogForm({
                      topic_covered: "",
                      notes: "",
                      was_conducted: true,
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedDate &&
        classLogs.find(
          (log) =>
            new Date(log.class_date).toDateString() ===
            selectedDate.toDateString()
        ) ? (
          <div className="space-y-4">
            {classLogs
              .filter(
                (log) =>
                  new Date(log.class_date).toDateString() ===
                  selectedDate.toDateString()
              )
              .map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className={
                        log.was_conducted
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {log.was_conducted ? "Conducted" : "Cancelled"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(log.class_date)}
                    </span>
                  </div>
                  {log.topic_covered && (
                    <div className="mb-2">
                      <h4 className="font-medium text-sm">
                        Topic Covered:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {log.topic_covered}
                      </p>
                    </div>
                  )}
                  {log.notes && (
                    <div>
                      <h4 className="font-medium text-sm">Notes:</h4>
                      <p className="text-sm text-muted-foreground">
                        {log.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-medium mb-2 text-lg">
              No class log for this date
            </h3>
            <p className="text-muted-foreground mb-6">
              Add a class log to track what was taught and student
              attendance
            </p>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20"
              onClick={() => setShowAddClassLog(true)}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add Class Log
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</TabsContent>
          {/* <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border-0"
                    modifiers={{
                      classDay: classLogs
                        .filter((log) => log.was_conducted)
                        .map((log) => new Date(log.class_date)),
                    }}
                    modifiersStyles={{
                      classDay: {
                        backgroundColor: "rgb(34 197 94)",
                        color: "white",
                        fontWeight: "bold",
                      },
                    }}
                  />
                  <div className="mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Class conducted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    Class Log -{" "}
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <Button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                    onClick={() => setShowAddClassLog(true)}
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add Class Log
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddClassLog && (
                    <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="was_conducted"
                            checked={classLogForm.was_conducted}
                            onCheckedChange={(checked) =>
                              setClassLogForm((prev) => ({
                                ...prev,
                                was_conducted: checked as boolean,
                              }))
                            }
                          />
                          <Label htmlFor="was_conducted">
                            Class was conducted
                          </Label>
                        </div>
                        <div>
                          <Label htmlFor="topic">Topic Covered</Label>
                          <Input
                            id="topic"
                            value={classLogForm.topic_covered}
                            onChange={(e) =>
                              setClassLogForm((prev) => ({
                                ...prev,
                                topic_covered: e.target.value,
                              }))
                            }
                            placeholder="What topic was covered in this class?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={classLogForm.notes}
                            onChange={(e) =>
                              setClassLogForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            placeholder="Any additional notes about the class..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={addClassLog}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Class Log
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddClassLog(false);
                              setClassLogForm({
                                topic_covered: "",
                                notes: "",
                                was_conducted: true,
                              });
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDate &&
                  classLogs.find(
                    (log) =>
                      new Date(log.class_date).toDateString() ===
                      selectedDate.toDateString()
                  ) ? (
                    <div className="space-y-4">
                      {classLogs
                        .filter(
                          (log) =>
                            new Date(log.class_date).toDateString() ===
                            selectedDate.toDateString()
                        )
                        .map((log) => (
                          <div
                            key={log.id}
                            className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                className={
                                  log.was_conducted
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }
                              >
                                {log.was_conducted ? "Conducted" : "Cancelled"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(log.class_date)}
                              </span>
                            </div>
                            {log.topic_covered && (
                              <div className="mb-2">
                                <h4 className="font-medium text-sm">
                                  Topic Covered:
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {log.topic_covered}
                                </p>
                              </div>
                            )}
                            {log.notes && (
                              <div>
                                <h4 className="font-medium text-sm">Notes:</h4>
                                <p className="text-sm text-muted-foreground">
                                  {log.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="font-medium mb-2 text-lg">
                        No class log for this date
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Add a class log to track what was taught and student
                        attendance
                      </p>
                      <Button
                        variant="outline"
                        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20"
                        onClick={() => setShowAddClassLog(true)}
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Add Class Log
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent> */}

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Fee Management</CardTitle>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) =>
                      setSelectedMonth(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) =>
                      setSelectedYear(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - 2 + i
                      ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <div className="space-y-4">
                    {students.map((student) => {
                      const feeRecord = feeRecords.find(
                        (record) => record.student_id === student.id
                      );
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-6 border rounded-xl bg-gradient-to-br from-background to-accent/5"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">
                                {student.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Fee: {formatCurrency(student.fee_per_month)} for{" "}
                                {MONTHS[selectedMonth]} {selectedYear}
                              </p>
                              {feeRecord?.additional_notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Note: {feeRecord.additional_notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={feeRecord?.status === "paid" || false}
                              onCheckedChange={(checked) => {
                                if (checked && feeRecord) {
                                  markPaymentAsPaid(feeRecord.id);
                                }
                              }}
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                            />
                            <Badge
                              variant={
                                feeRecord?.status === "paid"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                feeRecord?.status === "paid"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : "bg-gradient-to-r from-red-500 to-pink-500"
                              }
                            >
                              {feeRecord?.status === "paid" ? "Paid" : "Due"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="font-medium mb-2 text-lg">
                      No students to manage fees for
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Add students first to manage their fee payments
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader>
                <CardTitle className="text-xl">Tuition Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-medium mb-4 text-lg">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">
                        Created:
                      </span>
                      <p className="text-foreground mt-1">
                        {formatDate(tuition.created_at)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">
                        Last Updated:
                      </span>
                      <p className="text-foreground mt-1">
                        {formatDate(tuition.updated_at)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">
                        Status:
                      </span>
                      <p className="text-foreground mt-1 capitalize">
                        {tuition.status}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">
                        Total Students:
                      </span>
                      <p className="text-foreground mt-1">
                        {stats.totalStudents}
                      </p>
                    </div>
                    {tuition.address && (
                      <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50 md:col-span-2">
                        <span className="font-medium text-muted-foreground">
                          Address:
                        </span>
                        <p className="text-foreground mt-1">
                          {tuition.address}
                        </p>
                      </div>
                    )}
                    {tuition.teaching_days &&
                      tuition.teaching_days.length > 0 && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50 md:col-span-2">
                          <span className="font-medium text-muted-foreground">
                            Teaching Schedule:
                          </span>
                          <p className="text-foreground mt-1">
                            {tuition.days_per_week} days per week:{" "}
                            {getTeachingDaysDisplay(tuition.teaching_days)}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Actions</h3>
                  {/* <Button
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-background to-accent/5 border-border/50 hover:from-accent/10 hover:to-accent/20"
                    onClick={() => {
                      toast.info("Edit tuition functionality coming soon");
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tuition Details
                  </Button> */}
                  <EditTuitionModal
                    tuition={tuition}
                    onTuitionUpdated={fetchTuitionDetails}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4 text-lg text-destructive">
                    Danger Zone
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20 hover:from-yellow-500/10 hover:to-orange-500/10 text-yellow-700 dark:text-yellow-400"
                      onClick={archiveTuition}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Tuition
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-110 transition-all duration-300"
          onClick={() => {
            if (activeTab === "students") {
              // This will be handled by the AddStudentModal trigger
            } else if (activeTab === "calendar") {
              setShowAddClassLog(true);
            } else if (activeTab === "payments") {
              toast.info("Record payment functionality coming soon");
            }
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

