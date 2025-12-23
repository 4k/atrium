"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/settings": "Settings",
  "/manage": "Manage",
  "/manage/members": "Household Members",
  "/manage/income": "Income Sources",
  "/manage/budget": "Budget Categories",
  "/manage/bills": "Bills",
  "/manage/pockets": "Pockets",
  "/manage/sinking-funds": "Sinking Funds",
  "/manage/children": "Children",
  "/manage/gifts": "Gifts",
  "/manage/travel": "Travel Plans",
  "/manage/targets": "Monthly Targets",
  "/manage/contributions": "Contributions",
  "/manage/allowances": "Allowances",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
