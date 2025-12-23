'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils'
import { CheckCircle2, XCircle, MoreVertical, RefreshCw, Link2, Unlink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type ConnectionStatus = {
  connected: boolean
  connectedAt?: string
  lastSyncedAt?: string
  tokenExpired?: boolean
  linkedAccounts?: number
  latestSync?: {
    type: string
    status: string
    recordsSynced: number
    startedAt: string
    completedAt?: string
  }
}

export function RevolutConnectionStatus({ householdId }: { householdId: string }) {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStatus()
  }, [householdId])

  async function fetchStatus() {
    try {
      const response = await fetch('/api/revolut/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch Revolut status:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    try {
      const response = await fetch('/api/revolut/connect')
      if (response.ok) {
        const { authUrl } = await response.json()
        window.location.href = authUrl
      }
    } catch (error) {
      console.error('Failed to connect Revolut:', error)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const response = await fetch('/api/revolut/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      })

      if (response.ok) {
        await fetchStatus()
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to sync Revolut:', error)
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm('Are you sure you want to disconnect Revolut? Historical data will be preserved.')) {
      return
    }

    try {
      const response = await fetch('/api/revolut/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        await fetchStatus()
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to disconnect Revolut:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revolut Connection</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!status.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Revolut Connection
          </CardTitle>
          <CardDescription>
            Connect your Revolut account to automatically sync balances and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnect} className="w-full">
            <Link2 className="mr-2 h-4 w-4" />
            Connect Revolut
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Revolut Connected
            </CardTitle>
            <CardDescription>
              {status.linkedAccounts || 0} account{status.linkedAccounts !== 1 ? 's' : ''} linked
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSync} disabled={syncing}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last synced:</span>
          <span className="font-medium">
            {status.lastSyncedAt ? formatRelativeTime(new Date(status.lastSyncedAt)) : 'Never'}
          </span>
        </div>

        {status.tokenExpired && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <XCircle className="h-4 w-4" />
            <span>Token expired. Please reconnect your account.</span>
          </div>
        )}

        {status.latestSync && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Latest sync:</span>
              <Badge variant={status.latestSync.status === 'success' ? 'default' : 'destructive'}>
                {status.latestSync.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Records synced:</span>
              <span className="font-medium">{status.latestSync.recordsSynced}</span>
            </div>
          </div>
        )}

        <Button onClick={handleSync} disabled={syncing} className="w-full" variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </CardContent>
    </Card>
  )
}
