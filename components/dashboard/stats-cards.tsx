"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Ticket, MessageSquare, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "סה״כ משתמשים",
    value: "1,234",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    name: "טיקטים פתוחים",
    value: "23",
    change: "-5%",
    changeType: "negative" as const,
    icon: Ticket,
  },
  {
    name: "הודעות היום",
    value: "4,521",
    change: "+18%",
    changeType: "positive" as const,
    icon: MessageSquare,
  },
  {
    name: "הזמנות השבוע",
    value: "89",
    change: "+24%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive" ? "text-success" : "text-destructive"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
