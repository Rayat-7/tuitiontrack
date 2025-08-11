import type React from "react"
import Sidebar from "@/components/Sidebar"

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="min-h-full bg-gradient-to-br from-transparent via-background/50 to-accent/5 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
