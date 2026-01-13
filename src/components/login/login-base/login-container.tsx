"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { LoginHero } from "./login-hero"

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
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Section */}
          <LoginHero />

          {/* Form Section */}
          <div className="animate-slideInRight">
            <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  )
}
