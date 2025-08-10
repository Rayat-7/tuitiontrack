"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen, DollarSign, Calendar, TrendingUp, Clock, Bell } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type DashboardStats = {
  totalTuitions: number
  totalStudents: number
  unpaidFees: number
  upcomingClasses: number
}

type TuitionSummary = {
  id: string
  name: string
  subject: string
  studentCount: number
  status: "active" | "archived"
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalTuitions: 0,
    totalStudents: 0,
    unpaidFees: 0,
    upcomingClasses: 0,
  })
  const [recentTuitions, setRecentTuitions] = useState<TuitionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [userSynced, setUserSynced] = useState(false)

  // Sync user first
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      console.log("🔍 Syncing user with Supabase...")

      try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", user.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching user:", fetchError)
          return
        }

        if (!existingUser) {
          console.log("Creating new user in database...")

          const userData = {
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
            role: "tutor" as const,
            is_active: true,
          }

          const { data, error: insertError } = await supabase.from("users").insert(userData).select().single()

          if (insertError) {
            console.error("Error creating user:", insertError)
          } else {
            console.log("✅ User created successfully:", data)
            setUserSynced(true)
          }
        } else {
          console.log("✅ User already exists")
          setUserSynced(true)
        }
      } catch (error) {
        console.error("Error in user sync:", error)
      }
    }

    syncUser()
  }, [isLoaded, user])

  // Fetch dashboard data after user is synced
  useEffect(() => {
    if (userSynced) {
      fetchDashboardData()
    }
  }, [userSynced])

  const fetchDashboardData = async () => {
    try {
      console.log("📊 Fetching dashboard data...")

      // Get user's ID from Supabase first
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user?.id)
        .single()

      if (userError || !userData) {
        console.log("User not found in database, using empty stats")
        setStats({
          totalTuitions: 0,
          totalStudents: 0,
          unpaidFees: 0,
          upcomingClasses: 0,
        })
        setRecentTuitions([])
        setLoading(false)
        return
      }

      // Fetch tuitions for this user
      const { data: tuitions, error: tuitionsError } = await supabase
        .from("tuitions")
        .select(`
          id,
          name,
          subject,
          status
        `)
        .eq("tutor_id", userData.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (tuitionsError) {
        console.error("Error fetching tuitions:", tuitionsError)
        setLoading(false)
        return
      }

      // For now, set simple stats (we'll add student count later)
      const totalTuitions = tuitions?.length || 0

      setStats({
        totalTuitions,
        totalStudents: 0, // We'll calculate this when we add students
        unpaidFees: 0, // We'll calculate this when we add fee tracking
        upcomingClasses: 0, // We'll calculate this when we add scheduling
      })

      // Format recent tuitions
      const formattedTuitions: TuitionSummary[] =
        tuitions?.slice(0, 3).map((t) => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          studentCount: 0, // We'll update this later
          status: t.status,
        })) || []

      setRecentTuitions(formattedTuitions)
      console.log("✅ Dashboard data loaded successfully")
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 pt-16 md:pt-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-muted to-muted/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Welcome back, {user?.firstName || "Tutor"}! 👋
            </h1>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
          </div>
          <p className="text-muted-foreground text-lg">Here's what's happening with your tuitions today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Total Tuitions</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-violet-600">{stats.totalTuitions}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active tuitions
              </p>
            </CardContent>
          </Card>

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
                Across all tuitions
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
              <div className="text-2xl font-bold text-red-600">{stats.unpaidFees}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Students with due fees
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-green-600">{stats.upcomingClasses}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Scheduled for today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tuitions */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Tuitions</CardTitle>
            <Link href="/tuitions">
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:from-primary/20 hover:to-primary/10"
              >
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTuitions.length > 0 ? (
              <div className="space-y-4">
                {recentTuitions.map((tuition) => (
                  <div
                    key={tuition.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/10 transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{tuition.name}</h3>
                        <p className="text-sm text-muted-foreground">{tuition.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                      >
                        {tuition.studentCount} students
                      </Badge>
                      <Badge
                        variant={tuition.status === "active" ? "default" : "secondary"}
                        className={tuition.status === "active" ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}
                      >
                        {tuition.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium mb-2 text-lg">No tuitions yet</h3>
                <p className="text-muted-foreground mb-6">Create your first tuition to get started</p>
                <Link href="/tuitions/new">
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Tuition
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/tuitions/new">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5 hover:from-violet-500/10 hover:to-purple-600/10">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-lg">New Tuition</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a new tuition group</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/attendance">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 hover:from-blue-500/10 hover:to-cyan-600/10">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-lg">Take Attendance</p>
                  <p className="text-sm text-muted-foreground mt-1">Mark student attendance</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fees">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 hover:from-green-500/10 hover:to-emerald-600/10">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-lg">Manage Fees</p>
                  <p className="text-sm text-muted-foreground mt-1">Track payments and dues</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/tuitions/new">
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-110 md:hidden">
          <Plus className="h-7 w-7" />
        </Button>
      </Link>
    </div>
  )
}








// Add this to the top of your app/dashboard/page.tsx file
// TEMPORARY DEBUG CODE - Remove after fixing

// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { supabase } from "@/lib/supabase";

// export default function Dashboard() {
//   const { user, isLoaded } = useUser();

//   // TEMPORARY: Test Supabase connection
//   useEffect(() => {
//     const testConnection = async () => {
//       console.log("🔍 Testing Supabase connection...");
      
//       // Test 1: Basic connection
//       try{
//        const { data, error } = await supabase
//       .from('users')
//       .select('*', { count: 'exact', head: true });
        
//         if (error) {
//           console.error("❌ Supabase connection failed:", error);
//         } else {
//           console.log("✅ Supabase connection successful:", data);
//         }
//       } catch (err) {
//         console.error("❌ Supabase connection error:", err);
//       }

//       // Test 2: Check environment variables
//       console.log("🔍 Environment check:");
//       console.log("SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
//       console.log("SUPABASE_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
//       // Test 3: Check user info
//       if (user) {
//         console.log("🔍 User info from Clerk:");
//         console.log("User ID:", user.id);
//         console.log("User email:", user.emailAddresses[0]?.emailAddress);
//         console.log("User name:", user.firstName, user.lastName);
//       }
//     };

//     if (isLoaded) {
//       testConnection();
//     }
//   }, [isLoaded, user]);

//   if (!isLoaded) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-8">
//       <h1>Dashboard Debug Mode</h1>
//       <p>Check the browser console (F12) for debug information.</p>
      
//       {user && (
//         <div className="mt-4">
//           <h2>User Info:</h2>
//           <p>ID: {user.id}</p>
//           <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
//           <p>Name: {user.firstName} {user.lastName}</p>
//         </div>
//       )}
//     </div>
//   );
// }








// // app/dashboard/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Users, BookOpen, DollarSign, Calendar } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import Link from "next/link";

// type DashboardStats = {
//   totalTuitions: number;
//   totalStudents: number;
//   unpaidFees: number;
//   upcomingClasses: number;
// };

// type TuitionSummary = {
//   id: string;
//   name: string;
//   subject: string;
//   studentCount: number;
//   status: 'active' | 'archived';
// };

// export default function Dashboard() {
//   const { user, isLoaded } = useUser();
//   const [stats, setStats] = useState<DashboardStats>({
//     totalTuitions: 0,
//     totalStudents: 0,
//     unpaidFees: 0,
//     upcomingClasses: 0
//   });
//   const [recentTuitions, setRecentTuitions] = useState<TuitionSummary[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isLoaded && user) {
//       fetchDashboardData();
//     }
//   }, [isLoaded, user]);

//   const fetchDashboardData = async () => {
//     try {
//       // Fetch tuitions with student count
//       const { data: tuitions, error: tuitionsError } = await supabase
//         .from('tuitions')
//         .select(`
//           id,
//           name,
//           subject,
//           status,
//           students(count)
//         `)
//         .eq('status', 'active');

//       if (tuitionsError) throw tuitionsError;

//       // Calculate stats
//       const totalTuitions = tuitions?.length || 0;
//       const totalStudents = tuitions?.reduce((sum, t) => sum + (t.students?.[0]?.count || 0), 0) || 0;

//       // Fetch unpaid fees count
//       const { count: unpaidCount } = await supabase
//         .from('fee_records')
//         .select('*', { count: 'exact', head: true })
//         .eq('status', 'due');

//       setStats({
//         totalTuitions,
//         totalStudents,
//         unpaidFees: unpaidCount || 0,
//         upcomingClasses: 0 // We'll implement this later
//       });

//       // Format tuitions data
//       const formattedTuitions: TuitionSummary[] = tuitions?.map(t => ({
//         id: t.id,
//         name: t.name,
//         subject: t.subject,
//         studentCount: t.students?.[0]?.count || 0,
//         status: t.status
//       })) || [];

//       setRecentTuitions(formattedTuitions.slice(0, 3));
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isLoaded || loading) {
//     return (
//       <div className="min-h-screen bg-background p-4">
//         <div className="animate-pulse space-y-4">
//           <div className="h-8 bg-muted rounded w-1/3"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-32 bg-muted rounded-lg"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto p-4 pb-20">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground">
//               Welcome back, {user?.firstName || 'Tutor'}!
//             </h1>
//             <p className="text-muted-foreground">
//               Here's what's happening with your tuitions today
//             </p>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <Card className="border-l-4 border-l-primary">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Tuitions</CardTitle>
//               <BookOpen className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-primary">{stats.totalTuitions}</div>
//               <p className="text-xs text-muted-foreground">Active tuitions</p>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-blue-500">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
//               <p className="text-xs text-muted-foreground">Across all tuitions</p>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-red-500">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Unpaid Fees</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600">{stats.unpaidFees}</div>
//               <p className="text-xs text-muted-foreground">Students with due fees</p>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-green-500">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600">{stats.upcomingClasses}</div>
//               <p className="text-xs text-muted-foreground">Scheduled for today</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Recent Tuitions */}
//         <Card className="mb-8">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Recent Tuitions</CardTitle>
//             <Link href="/tuitions">
//               <Button variant="outline" size="sm">
//                 View All
//               </Button>
//             </Link>
//           </CardHeader>
//           <CardContent>
//             {recentTuitions.length > 0 ? (
//               <div className="space-y-4">
//                 {recentTuitions.map((tuition) => (
//                   <div key={tuition.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
//                     <div className="flex items-center space-x-4">
//                       <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
//                         <BookOpen className="h-5 w-5 text-primary" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium">{tuition.name}</h3>
//                         <p className="text-sm text-muted-foreground">{tuition.subject}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Badge variant="outline">
//                         {tuition.studentCount} students
//                       </Badge>
//                       <Badge variant={tuition.status === 'active' ? 'default' : 'secondary'}>
//                         {tuition.status}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="font-medium mb-2">No tuitions yet</h3>
//                 <p className="text-muted-foreground mb-4">Create your first tuition to get started</p>
//                 <Link href="/tuitions/new">
//                   <Button>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add First Tuition
//                   </Button>
//                 </Link>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Link href="/tuitions/new">
//             <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//               <CardContent className="flex items-center justify-center p-6">
//                 <div className="text-center">
//                   <Plus className="h-8 w-8 text-primary mx-auto mb-2" />
//                   <p className="font-medium">New Tuition</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </Link>

//           <Link href="/attendance">
//             <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//               <CardContent className="flex items-center justify-center p-6">
//                 <div className="text-center">
//                   <Users className="h-8 w-8 text-primary mx-auto mb-2" />
//                   <p className="font-medium">Take Attendance</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </Link>

//           <Link href="/fees">
//             <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//               <CardContent className="flex items-center justify-center p-6">
//                 <div className="text-center">
//                   <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
//                   <p className="font-medium">Manage Fees</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </Link>
//         </div>
//       </div>

//       {/* Floating Action Button */}
//       <Link href="/tuitions/new">
//         <Button 
//           className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
//           size="icon"
//         >
//           <Plus className="h-6 w-6" />
//         </Button>
//       </Link>
//     </div>
//   );
// }