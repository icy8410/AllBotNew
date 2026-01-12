"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, RefreshCw, Loader2, Search } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  permissions: string
  managed: boolean
  mentionable: boolean
}

export function RolesPage() {
  const [guildId, setGuildId] = useState("")
  const [search, setSearch] = useState("")
  const [newRole, setNewRole] = useState({ name: "", color: "#5865F2" })
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    data: roles,
    isLoading,
    mutate,
  } = useSWR<DiscordRole[]>(guildId ? `/api/discord/roles?guildId=${guildId}` : null, fetcher)

  const filteredRoles = roles?.filter((role) => role.name.toLowerCase().includes(search.toLowerCase()))

  const handleCreateRole = async () => {
    if (!guildId || !newRole.name) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/discord/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          name: newRole.name,
          color: Number.parseInt(newRole.color.replace("#", ""), 16),
        }),
      })

      if (response.ok) {
        mutate()
        setNewRole({ name: "", color: "#5865F2" })
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("[v0] Error creating role:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!guildId || !confirm("האם אתה בטוח שברצונך למחוק את הרול?")) return

    try {
      await fetch(`/api/discord/roles?guildId=${guildId}&roleId=${roleId}`, {
        method: "DELETE",
      })
      mutate()
    } catch (error) {
      console.error("[v0] Error deleting role:", error)
    }
  }

  const intToHex = (color: number) => {
    return `#${color.toString(16).padStart(6, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ניהול רולים</h2>
          <p className="text-muted-foreground">צפה, צור ומחק רולים בשרת</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">מזהה שרת:</Label>
            <Input
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              placeholder="הכנס מזהה שרת"
              className="w-48 bg-secondary"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading || !guildId}>
            <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            רענן
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!guildId}>
                <Plus className="ml-2 h-4 w-4" />
                צור רול
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>צור רול חדש</DialogTitle>
                <DialogDescription>הכנס את פרטי הרול החדש</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">שם הרול</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="לדוגמה: Moderator"
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-color">צבע</Label>
                  <div className="flex gap-2">
                    <Input
                      id="role-color"
                      type="color"
                      value={newRole.color}
                      onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      value={newRole.color}
                      onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                      className="flex-1 bg-secondary"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  ביטול
                </Button>
                <Button onClick={handleCreateRole} disabled={isCreating || !newRole.name}>
                  {isCreating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Plus className="ml-2 h-4 w-4" />}
                  צור
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!guildId ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">הכנס מזהה שרת</h3>
              <p className="text-sm text-muted-foreground">הכנס את מזהה השרת שלך כדי לנהל רולים</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>רולים ({roles?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="חיפוש רול..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 bg-secondary pr-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRoles && filteredRoles.length > 0 ? (
              <div className="space-y-2">
                {filteredRoles
                  .sort((a, b) => b.position - a.position)
                  .map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: intToHex(role.color) }} />
                        <div>
                          <p className="font-medium" style={{ color: role.color ? intToHex(role.color) : undefined }}>
                            {role.name}
                          </p>
                          <p className="text-xs text-muted-foreground">ID: {role.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {role.managed && (
                          <Badge variant="secondary" className="text-xs">
                            מנוהל
                          </Badge>
                        )}
                        {role.mentionable && (
                          <Badge variant="outline" className="text-xs">
                            ניתן לאזכר
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">מיקום: {role.position}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.managed}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                <p className="text-muted-foreground">לא נמצאו רולים</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
