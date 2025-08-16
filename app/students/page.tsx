"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Search, Phone, GraduationCap, DollarSign, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import EditStudentModal from "@/components/EditStudentModal"

type StudentWithTuition = {
  id: string
  name: string
  phone?: string
  parent_phone?: string
  class_level: string
  fee_per_month: number
  notes?: string
  status: string
  tuition_id: string
  tuition_name: string
  tuition_subject: string
  created_at: string
}

export default function StudentsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [students, setStudents] = useState<StudentWithTuition[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentWithTuition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tuitionFilter, setTuitionFilter] = useState<string>("all")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [tuitions, setTuitions] = useState<{ id: string; name: string }[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentWithTuition | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      getCurrentUserId()
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (currentUserId) {
      fetchStudents()
      fetchTuitions()
    }
  }, [currentUserId])

  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.tuition_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (tuitionFilter !== "all") {
      filtered = filtered.filter((student) => student.tuition_id === tuitionFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, tuitionFilter])

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

  const fetchStudents = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          phone,
          parent_phone,
          class_level,
          fee_per_month,
          notes,
          status,
          tuition_id,
          created_at,
          tuitions!inner(
            id,
            name,
            subject,
            tutor_id
          )
        `)
        .eq("tuitions.tutor_id", currentUserId)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) throw error

      const studentsWithTuition: StudentWithTuition[] =
        data?.map((student) => ({
          id: student.id,
          name: student.name,
          phone: student.phone,
          parent_phone: student.parent_phone,
          class_level: student.class_level,
          fee_per_month: student.fee_per_month,
          notes: student.notes,
          status: student.status,
          tuition_id: student.tuition_id,
          tuition_name: student.tuitions.name,
          tuition_subject: student.tuitions.subject,
          created_at: student.created_at,
        })) || []

      setStudents(studentsWithTuition)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTuitions = async () => {
    if (!currentUserId) return

    try {
      const { data, error } = await supabase
        .from("tuitions")
        .select("id, name")
        .eq("tutor_id", currentUserId)
        .eq("status", "active")
        .order("name")

      if (error) throw error
      setTuitions(data || [])
    } catch (error) {
      console.error("Error fetching tuitions:", error)
    }
  }

  const handleStudentClick = (student: StudentWithTuition) => {
    setSelectedStudent(student)
  }

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                All Students
              </h1>
              <p className="text-muted-foreground text-lg">Manage all your students across tuitions</p>
            </div>
          </div>
          <Link href="/tuitions">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
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
                  <p className="text-sm text-muted-foreground">Total Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ৳{students.reduce((sum, student) => sum + student.fee_per_month, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tuitions</p>
                  <p className="text-2xl font-bold text-violet-600">{tuitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student or tuition name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tuitionFilter} onValueChange={setTuitionFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by tuition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tuitions</SelectItem>
                  {tuitions.map((tuition) => (
                    <SelectItem key={tuition.id} value={tuition.id}>
                      {tuition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-medium mb-2 text-lg">
                  {searchTerm || tuitionFilter !== "all" ? "No students found" : "No students yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || tuitionFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Add students to your tuitions to see them here"}
                </p>
                <Link href="/tuitions">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                    Go to Tuitions
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-background to-accent/5"
                    onClick={() => handleStudentClick(student)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.class_level}</p>
                          </div>
                        </div>
                        <EditStudentModal student={student} onStudentUpdated={fetchStudents} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300"
                        >
                          {student.tuition_name}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        {student.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        {student.parent_phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>Parent: {student.parent_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>৳{student.fee_per_month}/month</span>
                        </div>
                      </div>

                      {student.notes && (
                        <p className="text-sm text-muted-foreground bg-accent/20 p-2 rounded-md">{student.notes}</p>
                      )}
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
