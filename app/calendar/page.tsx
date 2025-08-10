// app/calendar/page.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus } from "lucide-react"
import Link from "next/link"

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-muted-foreground text-lg">View all your classes and schedules</p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-medium mb-2 text-lg">Calendar view coming soon</h3>
            <p className="text-muted-foreground mb-6">Comprehensive calendar with all your classes and events</p>
            <Link href="/tuitions">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
              >
                Go to Tuitions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
