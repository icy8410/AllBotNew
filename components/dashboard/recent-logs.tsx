"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserMinus, Trash2, Ticket, Shield, AlertTriangle } from "lucide-react"

const logs = [
  {
    id: "1",
    type: "member_join",
    message: "משתמש חדש הצטרף: user123#1234",
    time: "לפני 2 דקות",
    icon: UserPlus,
    color: "text-success",
  },
  {
    id: "2",
    type: "ticket_open",
    message: "טיקט חדש נפתח על ידי yael#5678",
    time: "לפני 5 דקות",
    icon: Ticket,
    color: "text-primary",
  },
  {
    id: "3",
    type: "message_delete",
    message: "הודעה נמחקה בערוץ #כללי",
    time: "לפני 8 דקות",
    icon: Trash2,
    color: "text-warning",
  },
  {
    id: "4",
    type: "member_leave",
    message: "משתמש עזב: david#9012",
    time: "לפני 15 דקות",
    icon: UserMinus,
    color: "text-destructive",
  },
  {
    id: "5",
    type: "verify",
    message: "sara#3456 עבר אימות בהצלחה",
    time: "לפני 20 דקות",
    icon: Shield,
    color: "text-success",
  },
  {
    id: "6",
    type: "warning",
    message: "אזהרת SLA: טיקט #123 ללא תגובה",
    time: "לפני 25 דקות",
    icon: AlertTriangle,
    color: "text-warning",
  },
]

export function RecentLogs() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>לוגים אחרונים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3">
              <div className={`rounded-lg bg-secondary p-2 ${log.color}`}>
                <log.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{log.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
