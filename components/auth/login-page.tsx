"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface ConfigStatus {
  configured: boolean
  missing: string[]
  redirectUri: string
  help?: string
}

export function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        setConfigStatus(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "no_code":
        return "לא התקבל קוד אימות מ-Discord"
      case "auth_failed":
        return "האימות נכשל. נסה שוב"
      case "config_error":
        return "שגיאת קונפיגורציה - משתני סביבה חסרים"
      case "access_denied":
        return "הגישה נדחתה. יש לאשר את ההרשאות"
      default:
        return `שגיאה: ${errorCode}`
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">דשבורד ניהול בוט</CardTitle>
          <CardDescription>התחבר עם Discord כדי לנהל את הבוט והשרת שלך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>שגיאת התחברות</AlertTitle>
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : configStatus && !configStatus.configured ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>קונפיגורציה חסרה</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>משתני סביבה חסרים:</p>
                <ul className="list-disc list-inside text-sm">
                  {configStatus.missing.map((v) => (
                    <li key={v} className="font-mono">
                      {v}
                    </li>
                  ))}
                </ul>
                <p className="text-xs mt-2">
                  הוסף אותם ב-Vercel Dashboard &gt; Settings &gt; Environment Variables או ב-Vars בסרגל הצד של v0
                </p>
              </AlertDescription>
            </Alert>
          ) : configStatus?.configured ? (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">מוכן להתחברות</AlertTitle>
              <AlertDescription className="text-green-400/80 text-xs">
                Redirect URI: {configStatus.redirectUri}
              </AlertDescription>
            </Alert>
          ) : null}

          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            disabled={loading || (configStatus && !configStatus.configured)}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
            התחבר עם Discord
          </Button>

          {configStatus && !configStatus.configured && (
            <p className="text-xs text-muted-foreground text-center">יש להגדיר את משתני הסביבה לפני ההתחברות</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
