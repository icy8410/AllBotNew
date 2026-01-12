"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const tickets = [
  {
    id: "1",
    user: "משה כהן",
    subject: "בעיה בהרשאות",
    status: "open",
    time: "לפני 5 דקות",
  },
  {
    id: "2",
    user: "יעל לוי",
    subject: "שאלה על הבוט",
    status: "claimed",
    time: "לפני 15 דקות",
  },
  {
    id: "3",
    user: "דוד ישראלי",
    subject: "דיווח על באג",
    status: "open",
    time: "לפני 32 דקות",
  },
  {
    id: "4",
    user: "שרה אברהם",
    subject: "בקשה לפיצ'ר חדש",
    status: "closed",
    time: "לפני שעה",
  },
]

const statusMap = {
  open: { label: "פתוח", variant: "default" as const },
  claimed: { label: "נתפס", variant: "secondary" as const },
  closed: { label: "סגור", variant: "outline" as const },
}

export function RecentTickets() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>טיקטים אחרונים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20" />
                <div>
                  <p className="font-medium">{ticket.user}</p>
                  <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={statusMap[ticket.status as keyof typeof statusMap].variant}>
                  {statusMap[ticket.status as keyof typeof statusMap].label}
                </Badge>
                <span className="text-xs text-muted-foreground">{ticket.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
