'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  isAuthorized: boolean
  userRole: string | null
  message: string | null
  children: ReactNode
}

/**
 * Client-side protected route wrapper
 * Shows toast and redirects if user is not authorized
 */
export function ProtectedRoute({
  isAuthorized,
  userRole,
  message,
  children,
}: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthorized && message) {
      toast.error(message, {
        duration: 5000,
      })
      // Redirect to login/admin after showing toast
      const timer = setTimeout(() => {
        router.push('/admin')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isAuthorized, message, router])

  // If not authorized, don't render children
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
