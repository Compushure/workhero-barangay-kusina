"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { LoginHero } from "./login-hero"
<<<<<<< HEAD

export function LoginContainer() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement your authentication logic here
      console.log("Login attempt:", { email, password })
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
=======
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { handleLoginSubmit } from "@/action-handlers/auth"
import { toast } from "sonner"
import { handleUserRole } from "@/lib/utils/role-router"
import { getUserRole } from "@/actions/auth"

export function LoginContainer() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    
    startTransition(async () => {
      const { error } = await handleLoginSubmit(formData);

      if (error) {
        setError('Invalid email or password');
        toast.error('Login Failed', {
          description: 'Invalid email or password. Please try again.',
        });
        return;
      }

      // Get user role after successful login
      await handleUserRole({ router, setError, getUserRole });
    });
>>>>>>> 5a187b421fe3b3bdca769bc77beef05a96abfa19
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Section */}
          <LoginHero />

          {/* Form Section */}
          <div className="animate-slideInRight">
<<<<<<< HEAD
            <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
=======
            <LoginForm onSubmit={handleSubmit} isSubmitting={isPending} />
>>>>>>> 5a187b421fe3b3bdca769bc77beef05a96abfa19
          </div>
        </div>
      </div>
    </div>
  )
}
