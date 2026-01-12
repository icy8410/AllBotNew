"use client"

import { Bell, Search, RefreshCw, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  global_name: string | null
}

interface HeaderProps {
  user?: DiscordUser
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user?.discriminator || "0") % 5}.png`

  const displayName = user?.global_name || user?.username || "Admin"

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="חיפוש..." className="w-64 bg-secondary pr-10" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            3
          </span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.refresh()}>
          <RefreshCw className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="mr-2 flex items-center gap-3 border-r border-border pr-4">
              <div className="text-left">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">@{user?.username}</p>
              </div>
              <img
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
                className="h-9 w-9 rounded-full"
                crossOrigin="anonymous"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem disabled className="flex flex-col items-start">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">ID: {user?.id}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="ml-2 h-4 w-4" />
              התנתק
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
