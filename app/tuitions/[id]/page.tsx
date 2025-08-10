"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  ArrowLeft,
  BookOpen,
  Users,
  CalendarIcon,
  DollarSign,
  Settings,
  Plus,
  Edit,
  MoreVertical,
  CalendarPlus,
  Receipt,
  Phone,
  GraduationCap,
  Clock,
  TrendingUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"
import AddStudentModal from "@/components/AddStudentModal"

type TuitionDetails = {
  id: string
  name: string
  subject: string
  description?: string
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
  created_at: string
}

export default function TuitionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const tuitionId = params.id as string

  const [tuition, setTuition] = useState<TuitionDetails | null>(null)
  const [stats, setStats] = useState<TuitionStats>({
    totalStudents: 0,
    attendanceRate: 0,
    unpaidFees: 0,
    recentClasses: 0,
  })
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("students")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (isLoaded && user && tuitionId) {
      fetchTuitionDetails()
    }
  }, [isLoaded, user, tuitionId])

  const fetchTuitionDetails = async () => {
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
        router.push("/dashboard")
        return
      }

      // Fetch tuition details
      const { data: tuitionData, error: tuitionError } = await supabase
        .from("tuitions")
        .select("*")
        .eq("id", tuitionId)
        .eq("tutor_id", userData.id)
        .single()

      if (tuitionError || !tuitionData) {
        toast.error("Tuition not found or access denied")
        router.push("/tuitions")
        return
      }

      setTuition(tuitionData)

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("tuition_id", tuitionId)
        .order("created_at", { ascending: false })

      if (studentsError) {
        console.error("Error fetching students:", studentsError)
      } else {
        setStudents(studentsData || [])
      }

      // Calculate stats
      const totalStudents = studentsData?.length || 0

      setStats({
        totalStudents,
        attendanceRate: 85, // Placeholder
        unpaidFees: 0, // We'll calculate this when we implement fee tracking
        recentClasses: 5, // Placeholder
      })
    } catch (error) {
      console.error("Error fetching tuition details:", error)
      toast.error("Failed to load tuition details")
    } finally {
      setLoading(false)
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

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-muted to-muted/50 rounded-xl"></div>
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
              <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm border shadow-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {tuition.name}
                </h1>
                <Badge
                  variant={tuition.status === "active" ? "default" : "secondary"}
                  className={tuition.status === "active" ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}
                >
                  {tuition.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{tuition.subject}</p>
              {tuition.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{tuition.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm border shadow-sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm border shadow-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active students
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Unpaid Fees</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.unpaidFees)}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Outstanding amount
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Recent Classes</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-purple-600">{stats.recentClasses}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                This month
              </p>
            </CardContent>
          </Card>
        </div>

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
                <AddStudentModal tuitionId={tuitionId} onStudentAdded={fetchTuitionDetails} />
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
                            <h3 className="font-medium text-lg">{student.name}</h3>
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
                          <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                            <MoreVertical className="h-4 w-4" />
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
                    <h3 className="font-medium mb-2 text-lg">No students yet</h3>
                    <p className="text-muted-foreground mb-6">Add your first student to get started</p>
                    <AddStudentModal tuitionId={tuitionId} onStudentAdded={fetchTuitionDetails} />
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
                  />
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
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add Class Log
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="font-medium mb-2 text-lg">No class log for this date</h3>
                    <p className="text-muted-foreground mb-6">
                      Add a class log to track what was taught and student attendance
                    </p>
                    <Button
                      variant="outline"
                      className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Add Today's Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Fee Management</CardTitle>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg">
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="font-medium mb-2 text-lg">Payment tracking coming soon</h3>
                  <p className="text-muted-foreground mb-6">Manage student fees and payment history</p>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
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
                  <h3 className="font-medium mb-4 text-lg">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">Created:</span>
                      <p className="text-foreground mt-1">{formatDate(tuition.created_at)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">Last Updated:</span>
                      <p className="text-foreground mt-1">{formatDate(tuition.updated_at)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">Status:</span>
                      <p className="text-foreground mt-1 capitalize">{tuition.status}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-border/50">
                      <span className="font-medium text-muted-foreground">Total Students:</span>
                      <p className="text-foreground mt-1">{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Actions</h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-background to-accent/5 border-border/50 hover:from-accent/10 hover:to-accent/20"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tuition Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-background to-accent/5 border-border/50 hover:from-accent/10 hover:to-accent/20"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Duplicate Tuition
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4 text-lg text-destructive">Danger Zone</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20 hover:from-yellow-500/10 hover:to-orange-500/10 text-yellow-700 dark:text-yellow-400"
                    >
                      Archive Tuition
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                    >
                      Delete Tuition
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
            // Quick action based on active tab
            if (activeTab === "students") {
              // Add student - this will be handled by the AddStudentModal
            } else if (activeTab === "calendar") {
              // Add class log
            } else if (activeTab === "payments") {
              // Record payment
            }
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

