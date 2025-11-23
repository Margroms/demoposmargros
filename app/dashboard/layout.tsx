"use client"

import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RestaurantOnboarding } from "@/components/restaurant-onboarding"
import { isRestaurantConfigured } from "@/lib/restaurant-settings"
import { useState, useEffect } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkOnboarding()
  }, [])

  const checkOnboarding = async () => {
    setChecking(true)
    try {
      const configured = await isRestaurantConfigured()
      setShowOnboarding(!configured)
    } catch (error) {
      // If there's an error (like table not existing), show onboarding anyway
      // The onboarding will handle the error when trying to save
      console.error("Error checking restaurant configuration:", error)
      setShowOnboarding(true)
    } finally {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      {showOnboarding && (
        <RestaurantOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  )
}
