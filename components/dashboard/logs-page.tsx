"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Download,
  UserPlus,
  UserMinus,
  Trash2,
  Ticket,
  Shield,
  AlertTriangle,
  MessageSquare,
  Edit,
} from "lucide-react"

const logTypes = {
  member_join: { label: "הצטרפות", icon: UserPlus, color: "text-success" },
  member_leave: { label: "עזיבה", icon: UserMinus, color: "text-destructive" },
  message_delete: { label: "מחיקת הודעה", icon: Trash2, color: "text-warning" },
  message_edit: { label: "עריכת הודעה", icon: Edit, color: "text-muted-foreground" },
  ticket_open: { label: "פתיחת טיקט", icon: Ticket, color: "text-primary" },
  ticket_close: { label: "סגירת טיקט", icon: Ticket, color: "text-muted-foreground" },
  verify: { label: "אימות", icon: Shield, color: "text-success" },
  warning: { label: "אזהרה", icon: AlertTriangle, color: "text-warning" },
  message: { label: "הודעה", icon: MessageSquare, color: "text-primary" },
}

const allLogs = [
  {
    id: "1",
    type: "member_join",
    message: "משתמש חדש הצטרף לשרת",
    user: "user123#1234",
    channel: null,
    timestamp: "2024-01-15 14:32:15",
  },
  {
    id: "2",
    type: "ticket_open",
    message: "טיקט חדש נפתח",
    user: "yael#5678",
    channel: "ticket-yael",
    timestamp: "2024-01-15 14:28:45",
  },
  {
    id: "3",
    type: "message_delete",
    message: "הודעה נמחקה",
    user: "david#9012",
    channel: "#כללי",
    timestamp: "2024-01-15 14:25:30",
  },
  {
    id: "4",
    type: "verify",
    message: "משתמש עבר אימות בהצלחה",
    user: "sara#3456",
    channel: "#אימות",
    timestamp: "2024-01-15 14:20:00",
  },
  {
    id: "5",
    type: "warning",
    message: "אזהרת SLA: טיקט ללא תגובה מעל 30 דקות",
    user: "System",
    channel: "ticket-moshe",
    timestamp: "2024-01-15 14:15:00",
  },
  {
    id: "6",
    type: "member_leave",
    message: "משתמש עזב את השרת",
    user: "olduser#0001",
    channel: null,
    timestamp: "2024-01-15 14:10:22",
  },
  {
    id: "7",
    type: "ticket_close",
    message: "טיקט נסגר",
    user: "Admin",
    channel: "ticket-david",
    timestamp: "2024-01-15 14:05:00",
  },
  {
    id: "8",
    type: "message_edit",
    message: "הודעה נערכה",
    user: "moshe#1111",
    channel: "#כללי",
    timestamp: "2024-01-15 14:00:45",
  },
]

export function LogsPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredLogs = allLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.type === filter
    const matchesSearch =
      log.message.includes(search) || log.user.includes(search) || (log.channel && log.channel.includes(search))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">לוגים</h2>
          <p className="text-muted-foreground">היסטוריית פעולות ואירועים בשרת</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          ייצוא לוגים
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>היסטוריית לוגים</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="חיפוש..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 bg-secondary pr-10"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48 bg-secondary">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="סוג אירוע" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="member_join">הצטרפות</SelectItem>
                  <SelectItem value="member_leave">עזיבה</SelectItem>
                  <SelectItem value="message_delete">מחיקת הודעה</SelectItem>
                  <SelectItem value="ticket_open">פתיחת טיקט</SelectItem>
                  <SelectItem value="ticket_close">סגירת טיקט</SelectItem>
                  <SelectItem value="verify">אימות</SelectItem>
                  <SelectItem value="warning">אזהרות</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const logType = logTypes[log.type as keyof typeof logTypes]
              const Icon = logType.icon

              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <div className={`rounded-lg bg-secondary p-2 ${logType.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">[{logType.label}]</span>
                      <span className="text-sm">{log.message}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>משתמש: {log.user}</span>
                      {log.channel && <span>ערוץ: {log.channel}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
