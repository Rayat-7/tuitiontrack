"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  Plus,
  FileText,
  Clock,
  Target,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "My Tuitions",
    href: "/tuitions",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-600",
    badge: "3",
  },
  {
    name: "All Students",
    href: "/students",
    icon: Users,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    gradient: "from-orange-500 to-red-600",
  },
  {
    name: "Fee Management",
    href: "/fees",
    icon: DollarSign,
    gradient: "from-yellow-500 to-orange-600",
    badge: "2",
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "Class Logs",
    href: "/logs",
    icon: FileText,
    gradient: "from-teal-500 to-cyan-600",
  },
]

const quickActions = [
  {
    name: "New Tuition",
    href: "/tuitions/new",
    icon: Plus,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Add Student",
    href: "/students/new",
    icon: Users,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "Record Payment",
    href: "/fees/new",
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-600",
  },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-72 transform bg-gradient-to-br from-background via-background to-accent/20 border-r border-border/50 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                TuitionTrack
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName || user?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-2 px-4">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                      active
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border border-primary/20 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    <div
                      className={cn(
                        "mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                        active
                          ? "bg-white/20 text-white shadow-lg"
                          : `bg-gradient-to-br ${item.gradient} text-white group-hover:shadow-lg`,
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant={active ? "secondary" : "outline"} className="ml-auto h-5 px-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 px-4">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:text-foreground hover:bg-accent/50"
                  >
                    <div
                      className={cn(
                        "mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br transition-all duration-200 group-hover:shadow-lg",
                        action.gradient,
                        "text-white",
                      )}
                    >
                      <action.icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-4">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent/50"
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <Settings className="h-4 w-4" />
              </div>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
