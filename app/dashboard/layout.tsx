"use client"

import type React from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
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
      <div className="h-full relative">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-zinc-900 text-white">
          <Sidebar className="text-white" />
        </div>
        <main className="md:pl-72">
          <Header />
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
      {showOnboarding && (
        <RestaurantOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  )
}
