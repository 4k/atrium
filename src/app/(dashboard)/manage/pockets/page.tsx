'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Person = Database['public']['Tables']['persons']['Row']
type Pocket = Database['public']['Tables']['pockets']['Row']
type PocketType = Pocket['type']

const pocketTypes: { value: PocketType; label: string }[] = [
  { value: 'bills', label: 'Bills' },
  { value: 'spending', label: 'Spending' },
  { value: 'savings', label: 'Savings' },
  { value: 'sinking', label: 'Sinking Fund' },
  { value: 'personal', label: 'Personal' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'investment', label: 'Investment' },
  { value: 'home', label: 'Home' },
]

const iconOptions = ['💰', '🏦', '📋', '🛒', '🛡️', '✈️', '📈', '🔧', '🏠', '🚗', '💳', '🎯']
const colorOptions = [
  { name: 'Slate', value: 'bg-slate-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
]

export default function PocketsPage() {
  const [pockets, setPockets] = useState<(Pocket & { owner?: Person })[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null)
  const [deletingPocket, setDeletingPocket] = useState<Pocket | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'savings' as PocketType,
    icon: '💰',
    color: 'bg-blue-500',
    owner_id: '' as string | null,
    current_balance: 0,
    monthly_allocation: 0,
    target_amount: null as number | null,
    target_date: '' as string | null,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const hId = user.user_metadata?.household_id
    if (!hId) return
    
    setHouseholdId(hId)

    // Fetch persons
    const { data: personsData } = await supabase
      .from('persons')
      .select('*')
      .eq('household_id', hId)
      .order('created_at')

    setPersons(personsData || [])

    // Fetch pockets with owner data
    const { data, error } = await supabase
      .from('pockets')
      .select(`
        *,
        owner:owner_id(*)
      `)
      .eq('household_id', hId)
      .order('created_at')

    if (error) {
      console.error('Error fetching pockets:', error)
    } else {
      setPockets(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingPocket(null)
    setFormData({
      name: '',
      type: 'savings',
      icon: '💰',
      color: 'bg-blue-500',
      owner_id: null,
      current_balance: 0,
      monthly_allocation: 0,
      target_amount: null,
      target_date: null,
    })
    setDialogOpen(true)
  }

  function openEditDialog(pocket: Pocket) {
    setEditingPocket(pocket)
    setFormData({
      name: pocket.name,
      type: pocket.type,
      icon: pocket.icon || '💰',
      color: pocket.color || 'bg-blue-500',
      owner_id: pocket.owner_id,
      current_balance: pocket.current_balance,
      monthly_allocation: pocket.monthly_allocation || 0,
      target_amount: pocket.target_amount,
      target_date: pocket.target_date,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const pocketData = {
      household_id: householdId,
      name: formData.name,
      type: formData.type,
      icon: formData.icon,
      color: formData.color,
      owner_id: formData.owner_id || null,
      current_balance: formData.current_balance,
      monthly_allocation: formData.monthly_allocation || null,
      target_amount: formData.target_amount || null,
      target_date: formData.target_date || null,
    }

    if (editingPocket) {
      const { error } = await supabase
        .from('pockets')
        .update(pocketData)
        .eq('id', editingPocket.id)

      if (error) {
        console.error('Error updating pocket:', error)
        alert('Failed to update pocket')
      }
    } else {
      const { error } = await supabase
        .from('pockets')
        .insert(pocketData)

      if (error) {
        console.error('Error creating pocket:', error)
        alert('Failed to create pocket')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingPocket) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('pockets')
      .delete()
      .eq('id', deletingPocket.id)

    if (error) {
      console.error('Error deleting pocket:', error)
      alert('Failed to delete pocket. It may have associated transactions.')
    }

    setDeleteDialogOpen(false)
    setDeletingPocket(null)
    fetchData()
  }

  const totalBalance = pockets.reduce((sum, p) => sum + p.current_balance, 0)
  const totalAllocations = pockets.reduce((sum, p) => sum + (p.monthly_allocation || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Pockets
          </h1>
          <p className="text-muted-foreground">
            Manage your savings pockets and allocations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pocket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPocket ? 'Edit Pocket' : 'Add Pocket'}
              </DialogTitle>
              <DialogDescription>
                {editingPocket
                  ? 'Update the details for this pocket'
                  : 'Create a new savings pocket'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="name">Pocket Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: PocketType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pocketTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div className={cn('w-4 h-4 rounded', formData.color)} />
                          {colorOptions.find(c => c.value === formData.color)?.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-4 h-4 rounded', color.value)} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select
                  value={formData.owner_id || 'shared'}
                  onValueChange={(value) => setFormData({ ...formData, owner_id: value === 'shared' ? null : value })}
                >
                  <SelectTrigger id="owner">
                    <SelectValue placeholder="Select owner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared">Shared (Household)</SelectItem>
                    {persons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: person.color }}
                          />
                          {person.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_balance">Current Balance</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step={0.01}
                    value={formData.current_balance}
                    onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_allocation">Monthly Allocation</Label>
                  <Input
                    id="monthly_allocation"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.monthly_allocation}
                    onChange={(e) => setFormData({ ...formData, monthly_allocation: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount (optional)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.target_amount || ''}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Goal amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_date">Target Date (optional)</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date || ''}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value || null })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPocket ? 'Save Changes' : 'Add Pocket'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalBalance)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Allocations</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalAllocations)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pockets</CardDescription>
            <CardTitle className="text-2xl">{pockets.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pockets</CardTitle>
          <CardDescription>
            Manage your savings pockets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pockets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pockets yet. Add your first pocket to start organizing your savings.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pocket</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pockets.map((pocket) => {
                  const progress = pocket.target_amount && pocket.target_amount > 0
                    ? Math.round((pocket.current_balance / pocket.target_amount) * 100)
                    : null

                  return (
                    <TableRow key={pocket.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', pocket.color)}>
                            <span className="text-lg">{pocket.icon || '💰'}</span>
                          </div>
                          <div>
                            <p className="font-medium">{pocket.name}</p>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {pocket.type}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pocket.owner_id ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: (pocket as any).owner?.color }}
                            />
                            {(pocket as any).owner?.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Shared</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(pocket.current_balance)}
                      </TableCell>
                      <TableCell>
                        {pocket.monthly_allocation
                          ? formatCurrency(pocket.monthly_allocation)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {pocket.target_amount ? (
                          <div className="min-w-[120px]">
                            <p className="text-sm">{formatCurrency(pocket.target_amount)}</p>
                            {progress !== null && (
                              <div className="flex items-center gap-2">
                                <Progress value={Math.min(progress, 100)} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground">{progress}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(pocket)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingPocket(pocket)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pocket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPocket?.name}"? This will also delete all associated transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
