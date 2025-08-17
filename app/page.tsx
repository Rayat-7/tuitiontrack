"use client"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import {
  BookOpen,
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
  MousePointer,
} from "lucide-react"
import Link from "next/link"
import { useUserSync } from "./hooks/useUserSync"

export default function Home() {
  const { user, isLoaded } = useUserSync()

  useEffect(() => {
    if (isLoaded && user) {
      redirect("/dashboard")
    }
  }, [isLoaded, user])

  useEffect(() => {
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
    <div className="bg-neutral-950 text-neutral-200 antialiased selection:bg-violet-500/30 selection:text-white scroll-smooth font-sans">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl opacity-25 motion-safe:animate-pulse bg-gradient-radial from-violet-500/35 to-transparent"></div>
        <div
          className="absolute right-[-15%] bottom-[-10%] h-[36rem] w-[36rem] rounded-full blur-3xl opacity-20 motion-safe:animate-pulse bg-gradient-radial from-pink-500/35 to-transparent"
          style={{ animationDelay: ".8s" }}
        ></div>
        <div className="absolute left-[8%] top-[20%] h-64 w-64 rounded-full bg-violet-500/20 blur-2xl opacity-20 motion-safe:animate-bounce"></div>
        <div
          className="absolute right-[10%] top-[30%] h-48 w-48 rounded-full bg-fuchsia-500/20 blur-2xl opacity-20 motion-safe:animate-bounce"
          style={{ animationDelay: ".6s" }}
        ></div>
        <div className="absolute left-[55%] top-[65%] h-24 w-24 rounded-full border border-white/10 motion-safe:animate-ping"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #171717 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mt-4 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/50">
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
                <a href="#screenshot" className="hover:text-white transition-colors font-sans">
                  Screenshot
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
                <Link
                  href="/sign-up"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm text-white hover:from-violet-500 hover:to-fuchsia-500 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.06)] font-sans"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto mt-10 h-64 w-[90%] rounded-[2.5rem] blur-3xl bg-gradient-radial from-white/10 to-transparent"></div>

        <div
          className="max-w-7xl md:pt-24 md:pb-20 transition-all duration-700 ease-out will-change-transform opacity-100 mr-auto ml-auto pt-18 pr-4 pb-14 pl-4 translate-y-0"
          data-reveal
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-violet-200 font-sans">
              <Star className="h-4 w-4" />
              Trusted by 1000+ tutors in Bangladesh
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08] font-sans">
              Manage your{" "}
              <span className="bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent font-sans">
                tuitions
              </span>{" "}
              like a pro
            </h1>

            <p className="mt-5 text-base md:text-lg text-neutral-400 font-sans">
              Track students, manage attendance, record daily logs, and handle fees — all in one beautiful, mobile‑first
              workspace.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-base text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-[0_8px_30px_rgba(88,28,135,0.35)] transition-all font-sans"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/0 px-6 py-3 text-base text-neutral-200 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all font-sans"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-2 font-sans">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Free to start
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
          </div>
        </div>
      </section>

      <section id="screenshot" className="relative">
        <div className="mx-auto max-w-9xl px-4 pb-10">
          <div className="mx-auto max-w-6xl">
            <div
              className="mb-6 flex items-end justify-between transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
              data-reveal
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white font-sans">
                  See your workspace at a glance
                </h2>
                <p className="mt-2 text-sm md:text-base text-neutral-400 font-sans">
                  A clean, focused view of your students, classes, attendance, logs, and fees.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1 font-sans">
                  <MousePointer className="h-3.5 w-3.5" />
                  Hover to preview
                </span>
              </div>
            </div>

            <div
              className="group relative rounded-2xl border border-white/10 bg-neutral-900/60 p-3 backdrop-blur transition-all hover:border-white/20 duration-700 ease-out will-change-transform opacity-100 translate-y-0"
              data-reveal
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-radial from-violet-500/12 via-transparent to-pink-500/12"></div>

              <div className="flex items-center justify-between rounded-t-xl border border-white/10 bg-neutral-950/60 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                </div>
                <div className="mx-4 flex-1">
                  <div className="mx-auto max-w-xl rounded-md border border-white/10 bg-white/5 px-3 py-1 text-center text-[11px] text-neutral-400 font-sans">
                    app.tuitiontrack.io/dashboard
                  </div>
                </div>
                <div className="flex items-center gap-3 text-neutral-400">
                  <RefreshCw className="h-4 w-4" />
                  <Share className="h-4 w-4" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-b-xl border-x border-b border-white/10 bg-neutral-950">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                ></div>
                <div className="relative">
                  <div className="aspect-[16/9] w-full origin-center transform-gpu transition-all duration-700 ease-out group-hover:scale-[1.01] group-hover:[transform:perspective(2000px)_rotateX(1.5deg)_rotateY(-2deg)]">
                    <img
                      src="/dark-ss2.png"
                      alt="App screenshot"
                      className="h-full w-full object-cover [mask-image:linear-gradient(to_bottom,black_90%,transparent_100%)]"
                    />
                  </div>
                  <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-2 text-[11px] text-neutral-300 backdrop-blur transition-opacity duration-500 opacity-0 group-hover:opacity-100 font-sans">
                    TuitionTrack Dashboard Preview
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-6 grid grid-cols-6 grid-rows-6 gap-4 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
              data-reveal
            >
              <div className="group col-span-6 md:col-span-3 row-span-3 relative overflow-hidden transition-all hover:border-violet-400/40 hover:shadow-[0_0_60px_-8px_rgba(139,92,246,.45)] border-white/10 border rounded-2xl pt-5 pr-5 pb-5 pl-5">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white tracking-tight font-sans">Attendance & Schedules</p>
                    <p className="text-xs text-neutral-400 font-sans">Visual timeline to keep classes on track.</p>
                  </div>
                </div>
                <div className="mt-4 h-[140px] rounded-xl border border-white/10 bg-neutral-900/60"></div>
              </div>

              <div className="group col-span-6 md:col-span-3 row-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden transition-all hover:border-emerald-400/40 hover:shadow-[0_0_60px_-8px_rgba(16,185,129,.45)]">
                <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-emerald-500/20 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white tracking-tight font-sans">Daily Logs</p>
                    <p className="text-xs text-neutral-400 font-sans">Record work, homework, and exam notes.</p>
                  </div>
                </div>
                <div className="mt-4 h-[88px] rounded-xl border border-white/10 bg-neutral-900/60"></div>
              </div>

              <div className="group col-span-3 md:col-span-2 row-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden transition-all hover:border-pink-400/40 hover:shadow-[0_0_60px_-8px_rgba(244,114,182,.45)]">
                <div className="absolute right-0 top-0 h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-pink-500/20 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white tracking-tight font-sans">Fees & Receipts</p>
                    <p className="text-xs text-neutral-400 font-sans">Track payments with instant receipts.</p>
                  </div>
                </div>
              </div>

              <div className="group col-span-3 md:col-span-2 row-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden transition-all hover:border-sky-400/40 hover:shadow-[0_0_60px_-8px_rgba(56,189,248,.45)]">
                <div className="absolute left-0 top-0 h-28 w-28 -translate-x-6 -translate-y-6 rounded-full bg-sky-500/20 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white tracking-tight font-sans">Student Tracking</p>
                    <p className="text-xs text-neutral-400 font-sans">Keep records and progress effortlessly.</p>
                  </div>
                </div>
              </div>

              <div className="group col-span-6 md:col-span-2 row-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden transition-all hover:border-rose-400/40 hover:shadow-[0_0_60px_-8px_rgba(244,63,94,.45)]">
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/20 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white tracking-tight font-sans">Parent Updates</p>
                    <p className="text-xs text-neutral-400 font-sans">Share progress and notes instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="mx-auto my-8 max-w-7xl px-4 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
        data-reveal
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      <section id="features" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div
            className="mx-auto max-w-3xl text-center transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
            data-reveal
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white font-sans">
              Everything you need to manage your tuitions
            </h2>
            <p className="mt-3 text-neutral-400 font-sans">
              Powerful features designed specifically for tutors in Bangladesh.
            </p>
          </div>

          <div
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
            data-reveal
          >
            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white font-sans">Tuition Management</h3>
              <p className="mt-2 text-sm text-neutral-400 font-sans">
                Organize tuitions, subjects, and teaching schedules in one place.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white font-sans">Student Tracking</h3>
              <p className="mt-2 text-sm text-neutral-400 font-sans">
                Keep detailed records and track academic progress effortlessly.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white font-sans">Daily Logs</h3>
              <p className="mt-2 text-sm text-neutral-400 font-sans">
                Record daily activities, homework, and upcoming exams.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white font-sans">Fee Management</h3>
              <p className="mt-2 text-sm text-neutral-400 font-sans">
                Track payments, generate receipts, and manage fee collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative">
        <div
          className="mx-auto max-w-7xl px-4 py-12 md:py-16 transition-all duration-700 ease-out will-change-transform opacity-100 translate-y-0"
          data-reveal
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white text-neutral-900">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-gradient-radial from-violet-600/20 via-transparent to-pink-600/20"></div>

            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight font-sans">
                  Simple, transparent pricing
                </h2>
                <p className="mt-3 text-neutral-600 font-sans">
                  Start free for 30 days. Continue for only ৳20/month via bKash.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-[0_12px_50px_-12px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-900 font-sans">Free Trial</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 font-sans">
                      <Clock className="h-3.5 w-3.5" />
                      30 days
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-neutral-900 font-sans">৳0</span>
                      <span className="pb-1 text-sm text-neutral-500 font-sans">for 30 days</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                      <li className="inline-flex items-center gap-2 font-sans">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        All core features
                      </li>
                      <li className="inline-flex items-center gap-2 font-sans">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Unlimited students
                      </li>
                      <li className="inline-flex items-center gap-2 font-sans">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Mobile access
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/sign-up"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm text-white hover:bg-neutral-800 transition-colors font-sans"
                    >
                      Start 30‑day Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-[0_12px_50px_-12px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-900 font-sans">Standard</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 font-sans">
                      <Smartphone className="h-3.5 w-3.5" />
                      bKash
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-neutral-900 font-sans">৳20</span>
                      <span className="pb-1 text-sm text-neutral-500 font-sans">per month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                      <li className="inline-flex items-center gap-2 font-sans">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Everything in Free
                      </li>
                      <li className="inline-flex items-center gap-2 font-sans">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Priority support
                      </li>
                      <li className="inline-flex items-center gap-2 font-sans">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Auto‑renew via bKash
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      href="/sign-up"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm text-white hover:bg-violet-500 transition-colors font-sans"
                    >
                      Subscribe — ৳20/month
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="text-xs text-neutral-500 text-center font-sans">After your 30‑day free trial ends.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-radial from-violet-600/30 via-transparent to-pink-600/30"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 font-sans">
                      Start your free 30‑day trial today
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm md:text-base text-neutral-600 font-sans">
                      Try everything with no commitment. Continue for only ৳20/month via bKash after your trial.
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm text-white hover:bg-neutral-800 transition-colors font-sans"
                      >
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <a
                        href="#"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors font-sans"
                      >
                        How to pay with bKash
                        <HelpCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
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
              <span className="select-none text-[16vw] leading-none font-semibold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent font-sans">
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
