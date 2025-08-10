// app/tuitions/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Users, ArrowLeft, Calendar, DollarSign, MoreVertical, Archive } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

type TuitionWithStats = {
  id: string
  name: string
  subject: string
  description?: string
  status: "active" | "archived"
  created_at: string
  studentCount: number
  unpaidFees: number
  lastClassDate?: string
}

export default function TuitionsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [tuitions, setTuitions] = useState<TuitionWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")

  useEffect(() => {
    if (isLoaded && user) {
      fetchTuitions()
    }
  }, [isLoaded, user, activeTab])

  const fetchTuitions = async () => {
    try {
      setLoading(true)

      // Get user's tuitions with student count and fee stats
      const { data, error } = await supabase
        .from("tuitions")
        .select(`
          id,
          name,
          subject,
          description,
          status,
          created_at,
          students(
            id,
            fee_records(
              status
            )
          ),
          class_logs(
            date
          )
        `)
        .eq("status", activeTab)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Process the data to calculate stats
      const tuitionsWithStats: TuitionWithStats[] =
        data?.map((tuition) => {
          const studentCount = tuition.students?.length || 0

          // Count unpaid fees
          const unpaidFees =
            tuition.students?.reduce((count, student) => {
              const unpaidCount = student.fee_records?.filter((fee) => fee.status === "due").length || 0
              return count + unpaidCount
            }, 0) || 0

          // Get last class date
          const lastClassDate = tuition.class_logs?.[0]?.date || undefined

          return {
            id: tuition.id,
            name: tuition.name,
            subject: tuition.subject,
            description: tuition.description,
            status: tuition.status,
            created_at: tuition.created_at,
            studentCount,
            unpaidFees,
            lastClassDate,
          }
        }) || []

      setTuitions(tuitionsWithStats)
    } catch (error) {
      console.error("Error fetching tuitions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (tuitionId: string) => {
    try {
      const { error } = await supabase.from("tuitions").update({ status: "archived" }).eq("id", tuitionId)

      if (error) throw error

      // Refresh the list
      fetchTuitions()
    } catch (error) {
      console.error("Error archiving tuition:", error)
    }
  }

  const handleRestore = async (tuitionId: string) => {
    try {
      const { error } = await supabase.from("tuitions").update({ status: "active" }).eq("id", tuitionId)

      if (error) throw error

      // Refresh the list
      fetchTuitions()
    } catch (error) {
      console.error("Error restoring tuition:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Tuitions</h1>
              <p className="text-muted-foreground">Manage all your tuitions in one place</p>
            </div>
          </div>
          <Link href="/tuitions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tuition
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "archived")}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active ({tuitions.filter((t) => t.status === "active").length})</TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({tuitions.filter((t) => t.status === "archived").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {tuitions.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active tuitions yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first tuition to start managing students and classes
                  </p>
                  <Link href="/tuitions/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Tuition
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tuitions.map((tuition) => (
                  <Card key={tuition.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{tuition.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{tuition.subject}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle menu actions
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      {tuition.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{tuition.description}</p>
                      )}
                    </CardHeader>
                    <CardContent
                      className="space-y-4 cursor-pointer"
                      onClick={() => router.push(`/tuitions/${tuition.id}`)}
                    >
                      {/* Stats */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{tuition.studentCount} students</span>
                        </div>
                        {tuition.unpaidFees > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {tuition.unpaidFees} unpaid
                          </Badge>
                        )}
                      </div>

                      {/* Last activity */}
                      {tuition.lastClassDate && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Last class: {formatDate(tuition.lastClassDate)}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/tuitions/${tuition.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            Manage
                          </Button>
                        </Link>
                        <Link href={`/tuitions/${tuition.id}/attendance`}>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/tuitions/${tuition.id}/fees`}>
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived">
            {tuitions.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No archived tuitions</h3>
                  <p className="text-muted-foreground">Archived tuitions will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tuitions.map((tuition) => (
                  <Card key={tuition.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Archive className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{tuition.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{tuition.subject}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(tuition.id)}
                          className="flex-1"
                        >
                          Restore
                        </Button>
                        <Link href={`/tuitions/${tuition.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Link href="/tuitions/new">
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 md:hidden"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
