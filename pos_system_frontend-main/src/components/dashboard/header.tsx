"use client"

import { MobileSidebar } from "@/components/dashboard/sidebar"


export function Header() {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <MobileSidebar />
                <div className="ml-auto flex items-center space-x-4">
                    {/* <ModeToggle /> */}
                    {/* <UserNav /> */}
                    <div className="text-sm font-medium text-muted-foreground">Admin User</div>
                </div>
            </div>
        </div>
    )
}
