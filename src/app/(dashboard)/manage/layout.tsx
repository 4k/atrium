'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  DollarSign,
  PieChart,
  Receipt,
  Wallet,
  Baby,
  Gift,
  Plane,
  PiggyBank,
  Target,
  Scale,
  Coins,
} from 'lucide-react'

const navigation = [
  { name: 'Household Members', href: '/manage/members', icon: Users },
  { name: 'Income Sources', href: '/manage/income', icon: DollarSign },
  { name: 'Budget Categories', href: '/manage/budget', icon: PieChart },
  { name: 'Bills', href: '/manage/bills', icon: Receipt },
  { name: 'Pockets', href: '/manage/pockets', icon: Wallet },
  { name: 'Children', href: '/manage/children', icon: Baby },
  { name: 'Gifts', href: '/manage/gifts', icon: Gift },
  { name: 'Travel Plans', href: '/manage/travel', icon: Plane },
  { name: 'Sinking Funds', href: '/manage/sinking-funds', icon: PiggyBank },
  { name: 'Monthly Targets', href: '/manage/targets', icon: Target },
  { name: 'Contributions', href: '/manage/contributions', icon: Scale },
  { name: 'Allowances', href: '/manage/allowances', icon: Coins },
]

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      {/* Secondary Navigation */}
      <div className="border-b bg-card rounded-lg">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 p-2 min-w-max">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
