"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar"
import {
  ChefHat,
  ClipboardList,
  CreditCard,
  Home,
  Package,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

interface AppSidebarProps {
  role: string
  open?: boolean
  setOpen?: (open: boolean) => void
}

export function AppSidebar({ role, open: openProp, setOpen: setOpenProp }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  // Use internal state if props not provided
  const [internalOpen, setInternalOpen] = useState(false)
  const openState = openProp !== undefined ? openProp : internalOpen
  
  const setOpenState: React.Dispatch<React.SetStateAction<boolean>> = 
    setOpenProp !== undefined
      ? ((value: React.SetStateAction<boolean>) => {
          if (typeof value === 'function') {
            setOpenProp(value(openState))
          } else {
            setOpenProp(value)
          }
        }) as React.Dispatch<React.SetStateAction<boolean>>
      : setInternalOpen

  // Inner component that has access to sidebar context
  const SidebarContentInner = () => {
    const { open, animate } = useSidebar()
    
    return (
      <>
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 py-4">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm whitespace-pre">Restaurant POS</span>
                <span className="text-xs text-muted-foreground capitalize">{role}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 px-2 mb-1">
              {open ? "Navigation" : ""}
            </div>
            {navigationLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>

          {/* Switch Section Links */}
          <div className="mt-6 flex flex-col gap-2">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 px-2 mb-1">
              {open ? "Switch Section" : ""}
            </div>
            {switchSectionLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-start gap-2 group/sidebar py-2 w-full">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ) : (
                  <Sun className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                )}
                {open && (
                  <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block">
                    Theme
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Link href="#" className="flex items-center justify-start gap-2 group/sidebar py-2">
            <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            {open && (
              <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block">
                Settings
              </span>
            )}
          </Link>

          {/* User Profile */}
          <div className="flex items-center justify-start gap-2 group/sidebar py-2 w-full">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="/placeholder.svg" alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate text-neutral-700 dark:text-neutral-200">{name}</span>
                <span className="text-xs text-muted-foreground truncate">{email}</span>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-start gap-2 group/sidebar py-2 w-full"
          >
            <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            {open && (
              <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block">
                Logout
              </span>
            )}
          </button>
        </div>
      </>
    )
  }

  // AUTH SYSTEM COMMENTED OUT - STATIC USER INFO
  const [email] = useState<string>("admin@restaurant.com")
  const [name] = useState<string>("Admin User")

  const handleLogout = async () => {
    router.replace("/")
  }

  // Role-specific navigation links
  const roleLinks = {
    waiter: [
      { href: "/dashboard/waiter", label: "Tables", icon: Home },
    ],
    admin: [
      { href: "/dashboard/admin", label: "Overview", icon: Home },
      { href: "/dashboard/admin/menu", label: "Menu", icon: Package },
    ],
    kitchen: [
      { href: "/dashboard/kitchen", label: "Orders Queue", icon: ChefHat },
    ],
    billing: [
      { href: "/dashboard/billing", label: "Active Bills", icon: CreditCard },
    ],
    inventory: [
      { href: "/dashboard/inventory", label: "Overview", icon: Package },
    ],
  }

  const links = roleLinks[role as keyof typeof roleLinks] || []

  // All section links for switching
  const sectionLinks = [
    { href: "/dashboard/admin", label: "Admin", icon: ClipboardList },
    { href: "/dashboard/kitchen", label: "Kitchen", icon: ChefHat },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/waiter", label: "Waiter", icon: Home },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  ]

  // Convert links to SidebarLink format
  const navigationLinks = links.map((link) => {
    const Icon = link.icon
    const isActive = pathname === link.href
    return {
      label: link.label,
      href: link.href,
      icon: (
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-neutral-700 dark:text-neutral-200"}`} />
      ),
    }
  })

  const switchSectionLinks = sectionLinks.map((link) => {
    const Icon = link.icon
    const isActive = pathname.startsWith(link.href)
    return {
      label: link.label,
      href: link.href,
      icon: (
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-neutral-700 dark:text-neutral-200"}`} />
      ),
    }
  })

  return (
    <Sidebar open={openState} setOpen={setOpenState}>
      <SidebarBody className="justify-between gap-10 h-full">
        <SidebarContentInner />
      </SidebarBody>
    </Sidebar>
  )
}