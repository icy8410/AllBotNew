"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, RotateCcw, Loader2, RefreshCw, Hash } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function RealSettingsPage() {
  const [guildId, setGuildId] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const {
    data: channels,
    isLoading: channelsLoading,
    mutate: refreshChannels,
  } = useSWR(guildId ? `/api/discord/channels?guildId=${guildId}` : null, fetcher)

  const {
    data: roles,
    isLoading: rolesLoading,
    mutate: refreshRoles,
  } = useSWR(guildId ? `/api/discord/roles?guildId=${guildId}` : null, fetcher)

  const isLoading = channelsLoading || rolesLoading

  const textChannels = channels?.filter((c: any) => c.type === 0) || []
  const categories = channels?.filter((c: any) => c.type === 4) || []

  const [ticketSettings, setTicketSettings] = useState({
    enabled: true,
    categoryId: "",
    logChannelId: "",
    supportRoleId: "",
    slaWarningMinutes: 30,
    slaCloseMinutes: 60,
  })

  const [welcomeSettings, setWelcomeSettings] = useState({
    enabled: true,
    channelId: "",
    embedEnabled: true,
    embedTitle: "ברוכים הבאים!",
    embedDescription: "ברוך הבא {user} לשרת שלנו! אנחנו שמחים שהצטרפת.",
    embedColor: "#5865F2",
  })

  const [verifySettings, setVerifySettings] = useState({
    enabled: true,
    channelId: "",
    roleId: "",
    buttonText: "אמת אותי",
    cooldownSeconds: 60,
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Here you would save to your database
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const refreshData = () => {
    refreshChannels()
    refreshRoles()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">הגדרות</h2>
          <p className="text-muted-foreground">הגדר את מערכות הבוט</p>
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
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading || !guildId}>
            <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            רענן
          </Button>
        </div>
      </div>

      {!guildId ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Hash className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">הכנס מזהה שרת</h3>
              <p className="text-sm text-muted-foreground">הכנס את מזהה השרת שלך כדי לטעון את הערוצים והרולים</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="tickets">טיקטים</TabsTrigger>
            <TabsTrigger value="welcome">Welcome</TabsTrigger>
            <TabsTrigger value="verify">אימות</TabsTrigger>
            <TabsTrigger value="logs">לוגים</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>מערכת טיקטים</CardTitle>
                    <CardDescription>הגדרות למערכת הטיקטים המתקדמת</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tickets-enabled">מופעל</Label>
                    <Switch
                      id="tickets-enabled"
                      checked={ticketSettings.enabled}
                      onCheckedChange={(checked) => setTicketSettings({ ...ticketSettings, enabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">קטגוריית טיקטים</Label>
                      <Select
                        value={ticketSettings.categoryId}
                        onValueChange={(value) => setTicketSettings({ ...ticketSettings, categoryId: value })}
                      >
                        <SelectTrigger id="category" className="bg-secondary">
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="log-channel">ערוץ לוגים</Label>
                      <Select
                        value={ticketSettings.logChannelId}
                        onValueChange={(value) => setTicketSettings({ ...ticketSettings, logChannelId: value })}
                      >
                        <SelectTrigger id="log-channel" className="bg-secondary">
                          <SelectValue placeholder="בחר ערוץ" />
                        </SelectTrigger>
                        <SelectContent>
                          {textChannels.map((ch: any) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              #{ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="support-role">רול תמיכה</Label>
                      <Select
                        value={ticketSettings.supportRoleId}
                        onValueChange={(value) => setTicketSettings({ ...ticketSettings, supportRoleId: value })}
                      >
                        <SelectTrigger id="support-role" className="bg-secondary">
                          <SelectValue placeholder="בחר רול" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map((role: any) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sla-warning">אזהרת SLA (דקות)</Label>
                      <Input
                        id="sla-warning"
                        type="number"
                        value={ticketSettings.slaWarningMinutes}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
                            slaWarningMinutes: Number.parseInt(e.target.value),
                          })
                        }
                        className="bg-secondary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sla-close">סגירה אוטומטית (דקות)</Label>
                      <Input
                        id="sla-close"
                        type="number"
                        value={ticketSettings.slaCloseMinutes}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
                            slaCloseMinutes: Number.parseInt(e.target.value),
                          })
                        }
                        className="bg-secondary"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    איפוס
                  </Button>
                  <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="welcome">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>מערכת Welcome</CardTitle>
                    <CardDescription>הגדרות להודעות ברוכים הבאים</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="welcome-enabled">מופעל</Label>
                    <Switch
                      id="welcome-enabled"
                      checked={welcomeSettings.enabled}
                      onCheckedChange={(checked) => setWelcomeSettings({ ...welcomeSettings, enabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="welcome-channel">ערוץ Welcome</Label>
                      <Select
                        value={welcomeSettings.channelId}
                        onValueChange={(value) => setWelcomeSettings({ ...welcomeSettings, channelId: value })}
                      >
                        <SelectTrigger id="welcome-channel" className="bg-secondary">
                          <SelectValue placeholder="בחר ערוץ" />
                        </SelectTrigger>
                        <SelectContent>
                          {textChannels.map((ch: any) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              #{ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="embed-color">צבע Embed</Label>
                      <div className="flex gap-2">
                        <Input
                          id="embed-color"
                          type="color"
                          value={welcomeSettings.embedColor}
                          onChange={(e) => setWelcomeSettings({ ...welcomeSettings, embedColor: e.target.value })}
                          className="h-10 w-20 cursor-pointer"
                        />
                        <Input
                          value={welcomeSettings.embedColor}
                          onChange={(e) => setWelcomeSettings({ ...welcomeSettings, embedColor: e.target.value })}
                          className="flex-1 bg-secondary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="embed-title">כותרת Embed</Label>
                      <Input
                        id="embed-title"
                        value={welcomeSettings.embedTitle}
                        onChange={(e) => setWelcomeSettings({ ...welcomeSettings, embedTitle: e.target.value })}
                        className="bg-secondary"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="embed-description">תיאור Embed</Label>
                      <Textarea
                        id="embed-description"
                        value={welcomeSettings.embedDescription}
                        onChange={(e) => setWelcomeSettings({ ...welcomeSettings, embedDescription: e.target.value })}
                        className="bg-secondary min-h-[100px]"
                        placeholder="השתמש ב-{user} לשם המשתמש, {server} לשם השרת"
                      />
                      <p className="text-xs text-muted-foreground">
                        משתנים זמינים: {"{user}"}, {"{username}"}, {"{server}"}, {"{memberCount}"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="embed-enabled"
                        checked={welcomeSettings.embedEnabled}
                        onCheckedChange={(checked) => setWelcomeSettings({ ...welcomeSettings, embedEnabled: checked })}
                      />
                      <Label htmlFor="embed-enabled">שלח כ-Embed</Label>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    איפוס
                  </Button>
                  <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>מערכת אימות</CardTitle>
                    <CardDescription>הגדרות לאימות משתמשים חדשים</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="verify-enabled">מופעל</Label>
                    <Switch
                      id="verify-enabled"
                      checked={verifySettings.enabled}
                      onCheckedChange={(checked) => setVerifySettings({ ...verifySettings, enabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="verify-channel">ערוץ אימות</Label>
                      <Select
                        value={verifySettings.channelId}
                        onValueChange={(value) => setVerifySettings({ ...verifySettings, channelId: value })}
                      >
                        <SelectTrigger id="verify-channel" className="bg-secondary">
                          <SelectValue placeholder="בחר ערוץ" />
                        </SelectTrigger>
                        <SelectContent>
                          {textChannels.map((ch: any) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              #{ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verify-role">רול מאומת</Label>
                      <Select
                        value={verifySettings.roleId}
                        onValueChange={(value) => setVerifySettings({ ...verifySettings, roleId: value })}
                      >
                        <SelectTrigger id="verify-role" className="bg-secondary">
                          <SelectValue placeholder="בחר רול" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map((role: any) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="button-text">טקסט כפתור</Label>
                      <Input
                        id="button-text"
                        value={verifySettings.buttonText}
                        onChange={(e) => setVerifySettings({ ...verifySettings, buttonText: e.target.value })}
                        className="bg-secondary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cooldown">Cooldown (שניות)</Label>
                      <Input
                        id="cooldown"
                        type="number"
                        value={verifySettings.cooldownSeconds}
                        onChange={(e) =>
                          setVerifySettings({
                            ...verifySettings,
                            cooldownSeconds: Number.parseInt(e.target.value),
                          })
                        }
                        className="bg-secondary"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    איפוס
                  </Button>
                  <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>הגדרות לוגים</CardTitle>
                <CardDescription>בחר אילו אירועים לתעד</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { id: "memberJoin", label: "הצטרפות משתמשים" },
                    { id: "memberLeave", label: "עזיבת משתמשים" },
                    { id: "messageDelete", label: "מחיקת הודעות" },
                    { id: "messageEdit", label: "עריכת הודעות" },
                    { id: "roleChange", label: "שינוי רולים" },
                    { id: "channelCreate", label: "יצירת ערוצים" },
                    { id: "ban", label: "באנים" },
                    { id: "ticket", label: "אירועי טיקטים" },
                  ].map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                    >
                      <Label htmlFor={event.id}>{event.label}</Label>
                      <Switch id={event.id} defaultChecked />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    איפוס
                  </Button>
                  <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
