"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { ChefHat, ClipboardList, CreditCard, Home, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconMenu2 } from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  // Determine the current role from the URL
  const rolePath = pathname.split("/")[2]
  const role = ["waiter", "admin", "kitchen", "billing", "inventory"].includes(rolePath) ? rolePath : "waiter"

  // Role-specific data
  const roleData = {
    waiter: {
      name: "John Waiter",
      email: "john.waiter@restaurant.com",
      icon: Home,
      title: "Waiter Dashboard",
    },
    admin: {
      name: "Admin User",
      email: "admin@restaurant.com",
      icon: ClipboardList,
      title: "Admin Dashboard",
    },
    kitchen: {
      name: "Chef Gordon",
      email: "chef@restaurant.com",
      icon: ChefHat,
      title: "Kitchen Dashboard",
    },
    billing: {
      name: "Billing Staff",
      email: "billing@restaurant.com",
      icon: CreditCard,
      title: "Billing Dashboard",
    },
    inventory: {
      name: "Inventory Manager",
      email: "inventory@restaurant.com",
      icon: Package,
      title: "Inventory Dashboard",
    },
  }

  const currentRole = roleData[role as keyof typeof roleData]
  const RoleIcon = currentRole.icon

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar role={role} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-9 w-9 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <IconMenu2 className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <RoleIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <Link href={`/dashboard/${role}`} className="font-bold text-sm sm:text-base truncate">
                <span className="hidden sm:inline">{currentRole.title}</span>
                <span className="sm:hidden">{currentRole.title.split(' ')[0]}</span>
              </Link>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
