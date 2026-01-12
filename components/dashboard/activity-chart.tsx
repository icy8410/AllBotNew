"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "00:00", messages: 120, tickets: 5 },
  { name: "04:00", messages: 80, tickets: 2 },
  { name: "08:00", messages: 250, tickets: 8 },
  { name: "12:00", messages: 420, tickets: 15 },
  { name: "16:00", messages: 380, tickets: 12 },
  { name: "20:00", messages: 310, tickets: 9 },
  { name: "24:00", messages: 150, tickets: 4 },
]

export function ActivityChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>פעילות יומית</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5865f2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5865f2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#57f287" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#57f287" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111113",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="#5865f2"
                fillOpacity={1}
                fill="url(#colorMessages)"
                name="הודעות"
              />
              <Area
                type="monotone"
                dataKey="tickets"
                stroke="#57f287"
                fillOpacity={1}
                fill="url(#colorTickets)"
                name="טיקטים"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">הודעות</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">טיקטים</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
