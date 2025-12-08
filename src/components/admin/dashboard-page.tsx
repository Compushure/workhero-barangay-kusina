/**
 * Dashboard Page Component (Client)
 * ===================================
 * Admin dashboard home with navigation to user management.
 * Shows welcome message and available admin actions.
 */

'use client'

import { useTransition } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, Shield, LogOut, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function DashboardPage() {
  const { logout, user } = useAuth()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isPending}
              className="gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s users and roles from here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Add, edit, and delete users. Manage employee types and
                permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/manage">
                <Button className="w-full gap-2">
                  Manage Users
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure system settings and preferences. Coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
