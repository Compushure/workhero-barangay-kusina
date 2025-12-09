/**
 * Login Page Component (Client)
 * ===============================
 * Admin authentication form with email/password fields.
 * Uses react-hook-form with Zod validation and useTransition for smooth UX.
 * Integrates with auth context which uses action handlers for auth operations.
 */

'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, Shield } from 'lucide-react'
import { handleLoginSubmit } from '@/action-handlers/auth'
import { useRouter } from 'next/navigation'
import { getUserRole } from '@/actions/auth'

export function AdminLoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const { error } = await handleLoginSubmit(formData)
      const { role } = await getUserRole()
      if (error) {
        setError('Invalid email or password')
        toast.error('Login Failed', {
          description: 'Invalid email or password. Please try again.',
        })
      } else if (role.trim() !== 'superadmin') {
        setError('You are not authorized to access this page.')
        toast.error('Not Authorized', {
          description: `Your role (${role}) does not have access to the admin dashboard.`,
        })
      } else {
        toast.success('Welcome!', {
          description: 'You have successfully logged in.',
        })
        router.push('/admin/manage')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <h3 className="text-blue-500">COMPUSHURE</h3>
            <p>Admin Login</p>
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@company.com"
                  className="pl-10"
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Demo: Superadmin: tonilegayada@gmail.com / pass:Admin123 (change
              to compushure email soon) Dummy user: gpuser@gpmail.com /
              pass:Admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
