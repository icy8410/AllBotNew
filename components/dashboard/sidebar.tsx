"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Ticket,
  ScrollText,
  Settings,
  Users,
  MessageSquare,
  Shield,
  BarChart3,
  CircleDot,
} from "lucide-react"

const navigation = [
  { name: "סקירה כללית", href: "/", icon: LayoutDashboard },
  { name: "טיקטים", href: "/tickets", icon: Ticket },
  { name: "רולים", href: "/roles", icon: CircleDot },
  { name: "לוגים", href: "/logs", icon: ScrollText },
  { name: "הגדרות", href: "/settings", icon: Settings },
]

const systems = [
  { name: "משתמשים", href: "/users", icon: Users },
  { name: "הודעות", href: "/messages", icon: MessageSquare },
  { name: "אימות", href: "/verify", icon: Shield },
  { name: "סטטיסטיקות", href: "/stats", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col border-l border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">B</span>
        </div>
        <div>
          <h1 className="font-semibold text-foreground">Bot Dashboard</h1>
          <p className="text-xs text-muted-foreground">פאנל ניהול</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase text-muted-foreground">ראשי</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase text-muted-foreground">מערכות</p>
          {systems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-success/10 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-sm text-success">הבוט מחובר</span>
        </div>
      </div>
    </aside>
  )
}
