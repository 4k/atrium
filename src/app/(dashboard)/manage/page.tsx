'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
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
  ArrowRight,
} from 'lucide-react'

const sections = [
  {
    title: 'People & Income',
    items: [
      { name: 'Household Members', href: '/manage/members', icon: Users, description: 'Manage people in your household' },
      { name: 'Income Sources', href: '/manage/income', icon: DollarSign, description: 'Configure income streams' },
    ],
  },
  {
    title: 'Budget & Bills',
    items: [
      { name: 'Budget Categories', href: '/manage/budget', icon: PieChart, description: 'Set monthly spending budgets' },
      { name: 'Bills', href: '/manage/bills', icon: Receipt, description: 'Manage recurring bills' },
    ],
  },
  {
    title: 'Savings & Pockets',
    items: [
      { name: 'Pockets', href: '/manage/pockets', icon: Wallet, description: 'Configure savings pockets' },
      { name: 'Sinking Funds', href: '/manage/sinking-funds', icon: PiggyBank, description: 'Plan for irregular expenses' },
    ],
  },
  {
    title: 'Family & Life',
    items: [
      { name: 'Children', href: '/manage/children', icon: Baby, description: 'Track child-related expenses' },
      { name: 'Gifts', href: '/manage/gifts', icon: Gift, description: 'Plan gift budgets' },
      { name: 'Travel Plans', href: '/manage/travel', icon: Plane, description: 'Budget for trips' },
    ],
  },
  {
    title: 'Targets & Contributions',
    items: [
      { name: 'Monthly Targets', href: '/manage/targets', icon: Target, description: 'Set financial goals' },
      { name: 'Contributions', href: '/manage/contributions', icon: Scale, description: 'Configure fair share contributions' },
      { name: 'Allowances', href: '/manage/allowances', icon: Coins, description: 'Set personal spending allowances' },
    ],
  },
]

export default function ManagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manage Your Finances</h1>
        <p className="text-muted-foreground mt-1">
          Configure all aspects of your family budget dashboard
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-base mt-3">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
