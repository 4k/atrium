'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Link2, Plus, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type RevolutAccountInfo = {
  accountId: string
  name: string
  balance: number
  currency: string
  accountType: string
  linkedToPocketId?: string
}

type Pocket = {
  id: string
  name: string
  revolut_account_id: string | null
}

export function RevolutAccountLinker({ householdId }: { householdId: string }) {
  const [accounts, setAccounts] = useState<RevolutAccountInfo[]>([])
  const [pockets, setPockets] = useState<Pocket[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [householdId])

  async function fetchData() {
    try {
      const supabase = createClient()

      // Fetch existing pockets
      const { data: pocketsData, error: pocketsError } = await supabase
        .from('pockets')
        .select('id, name, revolut_account_id')
        .eq('household_id', householdId)

      if (pocketsError) {
        console.error('Error fetching pockets:', pocketsError)
        return
      }

      setPockets(pocketsData || [])

      // Fetch Revolut accounts from API
      const response = await fetch('/api/revolut/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'accounts' }),
      })

      if (response.ok) {
        // After syncing accounts, fetch the updated pockets
        const { data: updatedPockets } = await supabase
          .from('pockets')
          .select('id, name, revolut_account_id, current_balance')
          .eq('household_id', householdId)
          .not('revolut_account_id', 'is', null)

        if (updatedPockets) {
          const accountsInfo: RevolutAccountInfo[] = updatedPockets.map((pocket) => ({
            accountId: pocket.revolut_account_id!,
            name: pocket.name,
            balance: pocket.current_balance || 0,
            currency: 'EUR', // Default, would come from API in real scenario
            accountType: 'CURRENT',
            linkedToPocketId: pocket.id,
          }))

          setAccounts(accountsInfo)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLinkAccount(accountId: string, pocketId: string | 'new') {
    setSaving(true)
    try {
      const supabase = createClient()

      if (pocketId === 'new') {
        const account = accounts.find((a) => a.accountId === accountId)
        if (!account) return

        // Create new pocket
        const { data: newPocket, error } = await supabase
          .from('pockets')
          .insert({
            household_id: householdId,
            name: account.name,
            target_amount: 0,
            current_balance: account.balance,
            revolut_account_id: accountId,
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create pocket:', error)
          return
        }

        // Update local state
        setAccounts(
          accounts.map((a) =>
            a.accountId === accountId ? { ...a, linkedToPocketId: newPocket.id } : a
          )
        )
      } else {
        // Link to existing pocket
        const { error } = await supabase
          .from('pockets')
          .update({
            revolut_account_id: accountId,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', pocketId)

        if (error) {
          console.error('Failed to link pocket:', error)
          return
        }

        // Update local state
        setAccounts(
          accounts.map((a) => (a.accountId === accountId ? { ...a, linkedToPocketId: pocketId } : a))
        )
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to link account:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleUnlinkAccount(accountId: string) {
    setSaving(true)
    try {
      const supabase = createClient()
      const account = accounts.find((a) => a.accountId === accountId)

      if (!account?.linkedToPocketId) return

      // Unlink account
      const { error } = await supabase
        .from('pockets')
        .update({
          revolut_account_id: null,
          last_synced_at: null,
        })
        .eq('id', account.linkedToPocketId)

      if (error) {
        console.error('Failed to unlink account:', error)
        return
      }

      // Update local state
      setAccounts(
        accounts.map((a) => (a.accountId === accountId ? { ...a, linkedToPocketId: undefined } : a))
      )

      router.refresh()
    } catch (error) {
      console.error('Failed to unlink account:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revolut Accounts</CardTitle>
          <CardDescription>Loading accounts...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revolut Accounts</CardTitle>
          <CardDescription>
            No Revolut accounts found. Make sure you have connected your Revolut account.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link Revolut Accounts
        </CardTitle>
        <CardDescription>
          Map your Revolut accounts to pockets for automatic syncing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.accountId}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{account.name}</p>
                {account.linkedToPocketId && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Linked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(account.balance)} • {account.accountType}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {account.linkedToPocketId ? (
                <Button
                  onClick={() => handleUnlinkAccount(account.accountId)}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                >
                  Unlink
                </Button>
              ) : (
                <Select
                  onValueChange={(value) => handleLinkAccount(account.accountId, value)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Link to pocket..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create new pocket
                      </div>
                    </SelectItem>
                    {pockets
                      .filter((p) => !p.revolut_account_id)
                      .map((pocket) => (
                        <SelectItem key={pocket.id} value={pocket.id}>
                          {pocket.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
