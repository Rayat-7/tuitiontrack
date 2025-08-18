
"use client"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import {
  Users,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Smartphone,
  HelpCircle,
  RefreshCw,
  Share,
  GraduationCap,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Award,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useUserSync } from "./hooks/useUserSync"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { Button } from "@/components/ui/button"

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export default function Home() {
  const { user, isLoaded } = useUserSync()

  useEffect(() => {
    if (isLoaded && user) {
      redirect("/dashboard")
    }
  }, [isLoaded, user])

  useEffect(() => {
    const nav = document.querySelector("header")
    if (nav) {
      nav.style.transform = "translateY(-100%)"
      nav.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
      setTimeout(() => {
        nav.style.transform = "translateY(0)"
      }, 200)
    }

    const revealEls = document.querySelectorAll("[data-reveal]")
    revealEls.forEach((el, i) => {
      el.classList.add(
        "opacity-0",
        "translate-y-6",
        "transition-all",
        "duration-700",
        "ease-out",
        "will-change-transform",
      )
      ;(el as HTMLElement).style.transitionDelay = Math.min(i, 8) * 60 + "ms"
    })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            el.classList.remove("opacity-0", "translate-y-6")
            el.classList.add("opacity-100", "translate-y-0")
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12 },
    )

    revealEls.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-950 to-orange-800 text-neutral-200 antialiased selection:bg-violet-500/30 selection:text-white scroll-smooth font-sans overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[50rem] w-[50rem] -translate-x-1/2 rounded-full blur-3xl opacity-30 motion-safe:animate-pulse bg-gradient-radial from-violet-500/40 to-transparent"></div>
        <div
          className="absolute right-[-15%] bottom-[-10%] h-[45rem] w-[45rem] rounded-full blur-3xl opacity-25 motion-safe:animate-pulse bg-gradient-radial from-pink-500/40 to-transparent"
          style={{ animationDelay: ".8s" }}
        ></div>
        <div className="absolute left-[8%] top-[20%] h-80 w-80 rounded-full bg-violet-500/25 blur-3xl opacity-25 motion-safe:animate-bounce"></div>
        <div
          className="absolute right-[10%] top-[30%] h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl opacity-25 motion-safe:animate-bounce"
          style={{ animationDelay: ".6s" }}
        ></div>
        <div className="absolute left-[55%] top-[65%] h-32 w-32 rounded-full border border-white/10 motion-safe:animate-ping"></div>
        <div className="absolute left-[20%] bottom-[20%] h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl opacity-20 motion-safe:animate-pulse"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #171717 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mt-4 rounded-xl border border-white/10 bg-black ">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <Link href="#" className="group inline-flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white tracking-tight font-sans">
                  TT
                </div>
                <span className="text-sm md:text-base font-semibold tracking-tight text-white font-sans">
                  TuitionTrack
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
                <a href="#features" className="hover:text-white transition-colors font-sans">
                  Features
                </a>
                <a href="#pricing" className="hover:text-white transition-colors font-sans">
                  Pricing
                </a>
                <a href="#contact" className="hover:text-white transition-colors font-sans">
                  Contact
                </a>
              </nav>
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center rounded-lg border border-white/10 bg-white/0 px-4 py-2 text-sm text-neutral-200 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors font-sans"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        <section>
          <div className="relative pt-7">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  {/* <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-violet-200 font-sans backdrop-blur">
                    <Star className="h-4 w-4" />
                    Trusted by 1000+ tutors in Bangladesh
                  </div> */}

                  <h1 className="mt-8 max-w-2xl text-balance text-4xl md:text-4xl lg:text-4xl font-bold tracking-tight text-white leading-[1.05] font-sans">
                    The smart way to{" "}
                    <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse font-sans">
                     organaize
                    </span>{" "}
                    your tuition hustle
                  </h1>

                  <p className="mt-8 max-w-2xl text-pretty text-md text-neutral-300 font-sans leading-relaxed">
                    Transform chaos into clarity. Track students, manage attendance, handle fees, and grow your tuition
                    empire — all from one beautiful dashboard.
                  </p>

                 <div className="flex flex-col sm:flex-row gap-4 mt-7">
              <Link
                  href="/sign-in"
                  className="group relative inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 text-base font-semibold text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:scale-[1.02] font-sans"
                >
                  Get started for free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
               
              </div>

                  <div className="mt-8 flex flex-wrap items-center justify-start gap-6 text-sm text-neutral-400">
                    <span className="inline-flex items-center gap-2 font-sans">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      30-day free trial
                    </span>
                    <span className="inline-flex items-center gap-2 font-sans">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      No credit card required
                    </span>
                    <span className="inline-flex items-center gap-2 font-sans">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Mobile‑first design
                    </span>
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.2,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-neutral-950 absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-pink-900/40 backdrop-blur p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500"></span>
                      <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                      <span className="h-3 w-3 rounded-full bg-green-500"></span>
                    </div>
                    <div className="mx-4 flex-1">
                      <div className="mx-auto max-w-sm rounded-md border border-white/10 bg-white/5 px-3 py-1 text-center text-xs text-neutral-300 font-sans">
                        app.tuitiontrack.io/dashboard
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <RefreshCw className="h-4 w-4" />
                      <Share className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-b-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-pink-500/20"></div>
                    <img
                      src="/dark-ss2.png?height=600&width=1200"
                      alt="TuitionTrack Dashboard Preview"
                      className="h-full w-full object-cover object-top [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
                    />
                    <div className="absolute bottom-4 right-4 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-white backdrop-blur font-sans">
                      Live Dashboard Preview
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>

      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div
            className="mx-auto max-w-3xl text-center mb-16 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
            data-reveal
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                scale your tuitions
              </span>
            </h2>
            <p className="text-lg text-neutral-400 font-sans">
              Powerful automation meets intuitive design. Built specifically for tutors who want to focus on teaching,
              not paperwork.
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
            data-reveal
          >
            {/* Large card - Student Management */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-8 transition-all hover:border-violet-400/40 hover:shadow-[0_0_80px_-12px_rgba(139,92,246,0.4)]">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  {/* <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    <Users className="h-7 w-7" />
                  </div> */}
                  <div>
                    <h3 className="text-xl font-semibold text-white font-sans">Smart Student Management</h3>
                    <p className="text-sm text-neutral-400 font-sans">
                      Track progress, manage profiles, and stay organized
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-violet-400" />
                      <span className="text-sm font-medium text-white">Active Students</span>
                    </div>
                    <div className="text-2xl font-bold text-white">247</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 mb-2">
                      {/* <TrendingUp className="h-4 w-4 text-emerald-400" /> */}
                      <span className="text-sm font-medium text-white">This Month</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">+23</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance card */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-8 transition-all hover:border-emerald-400/40 hover:shadow-[0_0_80px_-12px_rgba(16,185,129,0.4)]">
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                {/* <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-4">
                  <Calendar className="h-7 w-7" />
                </div> */}
                <h3 className="text-xl font-semibold text-white font-sans mb-2">Smart Attendance</h3>
                <p className="text-sm text-neutral-400 font-sans mb-4">One-tap attendance with visual calendar</p>
                <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-3 backdrop-blur">
                  <div className="text-xs text-neutral-400 mb-1">Today's Rate</div>
                  <div className="text-lg font-bold text-emerald-400">94.2%</div>
                </div>
              </div>
            </div>

            {/* Fee Management */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/5 to-rose-500/5 p-8 transition-all hover:border-pink-400/40 hover:shadow-[0_0_80px_-12px_rgba(244,114,182,0.4)]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-pink-500/20 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                {/* <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-4">
                  <DollarSign className="h-7 w-7" />
                </div> */}
                <h3 className="text-xl font-semibold text-white font-sans mb-2">Fee Automation</h3>
                <p className="text-sm text-neutral-400 font-sans mb-4">Automated billing with bKash integration</p>
                <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-3 backdrop-blur">
                  <div className="text-xs text-neutral-400 mb-1">This Month</div>
                  <div className="text-lg font-bold text-pink-400">৳45,200</div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 p-8 transition-all hover:border-orange-400/40 hover:shadow-[0_0_80px_-12px_rgba(249,115,22,0.4)]">
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  {/* <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300 border border-orange-500/20">
                    <Target className="h-7 w-7" />
                  </div> */}
                  <div>
                    <h3 className="text-xl font-semibold text-white font-sans">Performance Analytics</h3>
                    <p className="text-sm text-neutral-400 font-sans">Deep insights into your tuition business</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur text-center">
                    <Shield className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">98%</div>
                    <div className="text-xs text-neutral-400">Retention</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur text-center">
                    <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">4.9</div>
                    <div className="text-xs text-neutral-400">Rating</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur text-center">
                    <Award className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">12</div>
                    <div className="text-xs text-neutral-400">Awards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="mx-auto my-16 max-w-7xl px-4 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
        data-reveal
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      <section id="pricing" className="py-16 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h1 className="text-center text-4xl font-semibold lg:text-4xl text-white font-sans">
              Pricing that Scales with You
            </h1>
            <p className="text-neutral-300 font-sans">
              TuitionTrack is evolving to be more than just management. It supports your entire tuition business helping
              you grow and innovate.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
            <div className="rounded-2xl flex flex-col justify-between space-y-8 border border-white/10 bg-gradient-to-br from-violet-300 via-violet-50/80 to-white text-neutral-900 p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
              <div className="space-y-4">
                <div>
                  <h2 className="font-medium text-xl">Free Trial</h2>
                  <span className="my-3 block text-2xl font-semibold">৳0 / month</span>
                  <p className="text-neutral-600 text-sm">30-day trial period</p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-neutral-300 text-neutral-900 hover:bg-neutral-50 bg-transparent"
                >
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>

                <hr className="border-dashed border-neutral-300" />

                <ul className="list-outside space-y-3 text-sm text-neutral-700">
                  {[
                    "Up to 50 Students",
                    "Basic Attendance Tracking",
                    "Fee Management",
                    "Mobile App Access",
                    "Email Support",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="size-3 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-300 to-white text-neutral-900 p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 relative overflow-hidden">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
               
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h2 className="font-medium text-xl">Standard</h2>
                    <span className="my-3 block text-2xl font-semibold">৳20 / month</span>
                    <p className="text-neutral-600 text-sm">Via bKash payment</p>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </div>

                <div>
                  <div className="text-sm font-medium text-neutral-800 mb-4">Everything in free plus:</div>

                  <ul className="list-outside space-y-3 text-sm text-neutral-700">
                    {[
                      "Unlimited Students & Tuitions",
                      "Advanced Analytics Dashboard",
                      "Automated Fee Reminders",
                      "bKash Payment Integration",
                      "Bulk SMS Notifications",
                      "Student Progress Reports",
                      "Attendance Calendar View",
                      "Priority Customer Support",
                      "Data Export & Backup",
                      "Custom Branding Options",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-3 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="relative">
            <div className="sticky top-20 z-0 mx-auto mb-10 flex h-40 items-center justify-center opacity-[0.06]">
              <span className="select-none text-[16vw] leading-none font-semibold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent font-sans hover:from-violet-500 hover:to-orange-400 transition-colors">
                TUITIONTRACK
              </span>
            </div>

            <div
              className="relative z-10 flex flex-col items-center text-center transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
              data-reveal
            >
              <Link href="#" className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white tracking-tight font-sans">
                  TT
                </div>
                <span className="text-lg font-semibold tracking-tight text-white font-sans">TuitionTrack</span>
              </Link>
              <p className="mt-3 max-w-xl text-sm text-neutral-400 font-sans">
                Empowering tutors across Bangladesh with modern management tools.
              </p>
              <div className="mt-6 flex items-center gap-6 text-sm text-neutral-400">
                <a href="#" className="hover:text-white transition-colors font-sans">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors font-sans">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-colors font-sans">
                  Support
                </a>
              </div>
              <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <p className="mt-6 text-xs text-neutral-500 font-sans">© 2025 TuitionTrack. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
