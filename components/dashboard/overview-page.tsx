"use client"

import { StatsCards } from "./stats-cards"
import { RecentTickets } from "./recent-tickets"
import { ActivityChart } from "./activity-chart"
import { RecentLogs } from "./recent-logs"

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">סקירה כללית</h2>
        <p className="text-muted-foreground">סטטיסטיקות ופעילות הבוט</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart />
        <RecentTickets />
      </div>

      <RecentLogs />
    </div>
  )
}
