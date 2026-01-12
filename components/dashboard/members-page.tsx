"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Loader2, Search, Users } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DiscordMember {
  user: {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    global_name: string | null
  }
  nick: string | null
  roles: string[]
  joined_at: string
}

export function MembersPage() {
  const [guildId, setGuildId] = useState("")
  const [search, setSearch] = useState("")

  const {
    data: members,
    isLoading,
    mutate,
  } = useSWR<DiscordMember[]>(guildId ? `/api/discord/members?guildId=${guildId}&limit=100` : null, fetcher)

  const { data: roles } = useSWR(guildId ? `/api/discord/roles?guildId=${guildId}` : null, fetcher)

  const rolesMap = new Map(roles?.map((r: any) => [r.id, r]) || [])

  const filteredMembers = members?.filter((m) => {
    const name = m.nick || m.user.global_name || m.user.username
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">משתמשים</h2>
          <p className="text-muted-foreground">צפה במשתמשי השרת</p>
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
        </div>
      </div>

      {!guildId ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">הכנס מזהה שרת</h3>
              <p className="text-sm text-muted-foreground">הכנס את מזהה השרת שלך כדי לצפות במשתמשים</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>משתמשים ({members?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="חיפוש משתמש..."
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
            ) : filteredMembers && filteredMembers.length > 0 ? (
              <div className="space-y-2">
                {filteredMembers.map((member) => {
                  const avatarUrl = member.user.avatar
                    ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${Number(member.user.discriminator) % 5}.png`
                  const displayName = member.nick || member.user.global_name || member.user.username

                  return (
                    <div
                      key={member.user.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={avatarUrl || "/placeholder.svg"}
                          alt={displayName}
                          className="h-10 w-10 rounded-full"
                          crossOrigin="anonymous"
                        />
                        <div>
                          <p className="font-medium">{displayName}</p>
                          <p className="text-xs text-muted-foreground">@{member.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-1">
                          {member.roles.slice(0, 3).map((roleId) => {
                            const role = rolesMap.get(roleId) as any
                            if (!role) return null
                            return (
                              <Badge
                                key={roleId}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : undefined,
                                  color: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : undefined,
                                }}
                              >
                                {role.name}
                              </Badge>
                            )
                          })}
                          {member.roles.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.roles.length - 3}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">הצטרף: {formatDate(member.joined_at)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                <p className="text-muted-foreground">לא נמצאו משתמשים</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
