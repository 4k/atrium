"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
  GiftIcon,
  PlaneIcon,
  TargetIcon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Budget",
    url: "/manage/budget",
    icon: BarChartIcon,
  },
  {
    title: "Bills",
    url: "/manage/bills",
    icon: ReceiptIcon,
  },
  {
    title: "Pockets",
    url: "/manage/pockets",
    icon: WalletIcon,
  },
  {
    title: "Sinking Funds",
    url: "/manage/sinking-funds",
    icon: PiggyBankIcon,
  },
]

const navManage = [
  {
    title: "Members",
    url: "/manage/members",
    icon: UsersIcon,
  },
  {
    title: "Income",
    url: "/manage/income",
    icon: BarChartIcon,
  },
  {
    title: "Targets",
    url: "/manage/targets",
    icon: TargetIcon,
  },
  {
    title: "Gifts",
    url: "/manage/gifts",
    icon: GiftIcon,
  },
  {
    title: "Travel",
    url: "/manage/travel",
    icon: PlaneIcon,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
  {
    title: "Get Help",
    url: "#",
    icon: HelpCircleIcon,
  },
  {
    title: "Search",
    url: "#",
    icon: SearchIcon,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string
    email: string
    avatar?: string
  }>({
    name: "User",
    email: "",
  })

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          avatar: authUser.user_metadata?.avatar_url,
        })
      }
    }

    fetchUser()
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Atrium</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} label="Overview" />
        <NavMain items={navManage} label="Manage" />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
