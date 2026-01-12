"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Shield, RefreshCw, Hash, Loader2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface GuildData {
  id: string
  name: string
  icon: string | null
  approximate_member_count: number
  approximate_presence_count: number
}

export function RealOverviewPage() {
  const [guildId, setGuildId] = useState<string>("")

  // Fetch guild data
  const {
    data: guild,
    isLoading: guildLoading,
    mutate: refreshGuild,
  } = useSWR<GuildData>(guildId ? `/api/discord/guild?id=${guildId}` : null, fetcher, { refreshInterval: 30000 })

  // Fetch channels
  const { data: channels, isLoading: channelsLoading } = useSWR(
    guildId ? `/api/discord/channels?guildId=${guildId}` : null,
    fetcher,
  )

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useSWR(
    guildId ? `/api/discord/roles?guildId=${guildId}` : null,
    fetcher,
  )

  const isLoading = guildLoading || channelsLoading || rolesLoading

  const stats = [
    {
      title: "סה״כ משתמשים",
      value: guild?.approximate_member_count || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "מחוברים כעת",
      value: guild?.approximate_presence_count || 0,
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "ערוצים",
      value: channels?.length || 0,
      icon: Hash,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "רולים",
      value: roles?.length || 0,
      icon: MessageSquare,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">סקירה כללית</h2>
          <p className="text-muted-foreground">נתונים בזמן אמת מהשרת שלך</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">מזהה שרת:</label>
            <input
              type="text"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              placeholder="הכנס מזהה שרת"
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refreshGuild()} disabled={isLoading || !guildId}>
            <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            רענן
          </Button>
        </div>
      </div>

      {guild && (
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            {guild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                className="h-16 w-16 rounded-full"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {guild.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{guild.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {guild.id}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!guildId && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">הכנס מזהה שרת</h3>
              <p className="text-sm text-muted-foreground">הכנס את מזהה השרת שלך כדי לראות נתונים בזמן אמת</p>
            </div>
          </CardContent>
        </Card>
      )}

      {guildId && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent channels */}
          {channels && channels.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>ערוצים אחרונים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {channels.slice(0, 10).map((channel: any) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>{channel.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {channel.type === 0 ? "טקסט" : channel.type === 2 ? "קול" : "אחר"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
