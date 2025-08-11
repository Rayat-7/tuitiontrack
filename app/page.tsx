"use client"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calendar, DollarSign, ArrowRight, CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import { useUserSync } from "./hooks/useUserSync"
import LandingNavbar from "@/components/landing-navbar"
import { HeroBackground } from "@/components/hero-background"

export default function Home() {
  const { user, isLoaded } = useUserSync()

  useEffect(() => {
    if (isLoaded && user) {
      redirect("/dashboard")
    }
  }, [isLoaded, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="h-4 w-4" />
              Trusted by 1000+ tutors in Bangladesh
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Manage Your{" "}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tuitions
              </span>{" "}
              Like a Pro
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Track students, manage attendance, record daily logs, and handle fees - all in one beautiful, mobile-first
              platform designed for tutors in Bangladesh.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-2 hover:bg-accent/50 transition-all duration-300 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Mobile-first design
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage Your Tuitions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for tutors in Bangladesh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Tuition Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Organize your tuitions, subjects, and teaching schedules in one centralized place.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Student Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Keep detailed records of all your students and track their academic progress.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Daily Logs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Record daily activities, homework assignments, and upcoming exams effortlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Fee Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  Track payments, generate receipts, and manage fee collection with ease.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10" />
            <CardContent className="relative text-center py-16 px-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Tuition Management?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
                Join thousands of tutors who have streamlined their teaching business with TuitionTrack. Start your free
                trial today!
              </p>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-violet-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4 inline-block"
            >
              TuitionTrack
            </Link>
            <p className="text-muted-foreground mb-8">
              Empowering tutors across Bangladesh with modern management tools
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}










// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useEffect } from "react";
// import { redirect } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { BookOpen, Users, Calendar, DollarSign, ArrowRight } from "lucide-react";
// import Link from "next/link";
// import { useUserSync } from "./hooks/useUserSync";


// export default function Home() {
//   const { user, isLoaded } = useUserSync();

//   useEffect(() => {
//     if (isLoaded && user) {
//       redirect('/dashboard');
//     }
//   }, [isLoaded, user]);

//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="animate-pulse text-muted-foreground">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
//       {/* Hero Section */}
//       <section className="container mx-auto px-4 pt-20 pb-16">
//         <div className="text-center max-w-4xl mx-auto">
//           <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
//             Manage Your <span className="text-primary">Tuitions</span> Like a Pro
//           </h1>
//           <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//             Track students, manage attendance, record daily logs, and handle fees - all in one beautiful, mobile-first platform designed for tutors in Bangladesh.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link href="/sign-up">
//               <Button size="lg" className="text-lg px-8 py-4">
//                 Get Started Free
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </Link>
//             <Link href="/sign-in">
//               <Button variant="outline" size="lg" className="text-lg px-8 py-4">
//                 Sign In
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="container mx-auto px-4 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <BookOpen className="h-6 w-6 text-primary" />
//               </div>
//               <CardTitle>Tuition Management</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-muted-foreground">
//                 Organize your tuitions, subjects, and teaching schedules in one place.
//               </p>
//             </CardContent>
//           </Card>

//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <Users className="h-6 w-6 text-blue-500" />
//               </div>
//               <CardTitle>Student Tracking</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-muted-foreground">
//                 Keep detailed records of all your students and their progress.
//               </p>
//             </CardContent>
//           </Card>

//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <Calendar className="h-6 w-6 text-green-500" />
//               </div>
//               <CardTitle>Daily Logs</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-muted-foreground">
//                 Record daily activities, homework, and upcoming exams effortlessly.
//               </p>
//             </CardContent>
//           </Card>

//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
//                 <DollarSign className="h-6 w-6 text-orange-500" />
//               </div>
//               <CardTitle>Fee Management</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-muted-foreground">
//                 Track payments, generate receipts, and manage fee collection easily.
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="container mx-auto px-4 py-16">
//         <Card className="bg-primary/5 border-primary/20">
//           <CardContent className="text-center py-12">
//             <h2 className="text-3xl font-bold text-foreground mb-4">
//               Ready to Transform Your Tuition Management?
//             </h2>
//             <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
//               Join thousands of tutors who have streamlined their teaching business with TuitionTrack. Start your free trial today!
//             </p>
//             <Link href="/sign-up">
//               <Button size="lg" className="text-lg px-8 py-4">
//                 Start Free Trial
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </section>
//     </div>
//   );









// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border g- border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
