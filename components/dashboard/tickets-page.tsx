"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, X } from "lucide-react"

const allTickets = [
  {
    id: "ticket-001",
    user: "משה כהן",
    userId: "123456789",
    subject: "בעיה בהרשאות",
    status: "open",
    claimedBy: null,
    createdAt: "2024-01-15 14:30",
    messages: 3,
  },
  {
    id: "ticket-002",
    user: "יעל לוי",
    userId: "987654321",
    subject: "שאלה על הבוט",
    status: "claimed",
    claimedBy: "Admin",
    createdAt: "2024-01-15 14:15",
    messages: 8,
  },
  {
    id: "ticket-003",
    user: "דוד ישראלי",
    userId: "456789123",
    subject: "דיווח על באג",
    status: "open",
    claimedBy: null,
    createdAt: "2024-01-15 13:58",
    messages: 2,
  },
  {
    id: "ticket-004",
    user: "שרה אברהם",
    userId: "789123456",
    subject: "בקשה לפיצ'ר חדש",
    status: "closed",
    claimedBy: "Mod1",
    createdAt: "2024-01-15 12:30",
    messages: 15,
  },
  {
    id: "ticket-005",
    user: "אבי גולן",
    userId: "321654987",
    subject: "עזרה בהגדרות",
    status: "open",
    claimedBy: null,
    createdAt: "2024-01-15 11:45",
    messages: 1,
  },
]

const statusMap = {
  open: { label: "פתוח", variant: "default" as const, color: "bg-primary" },
  claimed: { label: "נתפס", variant: "secondary" as const, color: "bg-warning" },
  closed: { label: "סגור", variant: "outline" as const, color: "bg-muted" },
}

export function TicketsPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredTickets = allTickets.filter((ticket) => {
    const matchesFilter = filter === "all" || ticket.status === filter
    const matchesSearch = ticket.user.includes(search) || ticket.subject.includes(search) || ticket.id.includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ניהול טיקטים</h2>
        <p className="text-muted-foreground">צפה ונהל את כל הטיקטים בשרת</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[200px] bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {allTickets.filter((t) => t.status === "open").length}
            </div>
            <p className="text-sm text-muted-foreground">טיקטים פתוחים</p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[200px] bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {allTickets.filter((t) => t.status === "claimed").length}
            </div>
            <p className="text-sm text-muted-foreground">בטיפול</p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[200px] bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {allTickets.filter((t) => t.status === "closed").length}
            </div>
            <p className="text-sm text-muted-foreground">נסגרו היום</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>כל הטיקטים</CardTitle>
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
                <SelectTrigger className="w-40 bg-secondary">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="סנן לפי" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="open">פתוחים</SelectItem>
                  <SelectItem value="claimed">בטיפול</SelectItem>
                  <SelectItem value="closed">סגורים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-right">
                  <th className="p-3 text-sm font-medium text-muted-foreground">מזהה</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">משתמש</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">נושא</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">סטטוס</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">נתפס ע״י</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">הודעות</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">נוצר</th>
                  <th className="p-3 text-sm font-medium text-muted-foreground">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-mono text-sm">{ticket.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20" />
                        <span>{ticket.user}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{ticket.subject}</td>
                    <td className="p-3">
                      <Badge variant={statusMap[ticket.status as keyof typeof statusMap].variant}>
                        {statusMap[ticket.status as keyof typeof statusMap].label}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{ticket.claimedBy || "-"}</td>
                    <td className="p-3 text-sm">{ticket.messages}</td>
                    <td className="p-3 text-sm text-muted-foreground">{ticket.createdAt}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
