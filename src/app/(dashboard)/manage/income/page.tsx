'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { DollarSign, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Person = Database['public']['Tables']['persons']['Row']
type IncomeSource = Database['public']['Tables']['income_sources']['Row']

type Frequency = 'monthly' | 'weekly' | 'one-time' | 'variable'

export default function IncomePage() {
  const [incomeSources, setIncomeSources] = useState<(IncomeSource & { person?: Person })[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)
  const [deletingSource, setDeletingSource] = useState<IncomeSource | null>(null)

  const [formData, setFormData] = useState({
    person_id: '',
    name: '',
    amount: 0,
    frequency: 'monthly' as Frequency,
    is_active: true,
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

    // Fetch income sources with person data
    const { data: incomeData, error } = await supabase
      .from('income_sources')
      .select(`
        *,
        person:persons!inner(*)
      `)
      .eq('persons.household_id', hId)
      .order('created_at')

    if (error) {
      console.error('Error fetching income sources:', error)
    } else {
      setIncomeSources(incomeData || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingSource(null)
    setFormData({
      person_id: persons[0]?.id || '',
      name: '',
      amount: 0,
      frequency: 'monthly',
      is_active: true,
    })
    setDialogOpen(true)
  }

  function openEditDialog(source: IncomeSource) {
    setEditingSource(source)
    setFormData({
      person_id: source.person_id,
      name: source.name,
      amount: source.amount,
      frequency: source.frequency,
      is_active: source.is_active,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const sourceData = {
      person_id: formData.person_id,
      name: formData.name,
      amount: formData.amount,
      frequency: formData.frequency,
      is_active: formData.is_active,
    }

    if (editingSource) {
      const { error } = await supabase
        .from('income_sources')
        .update(sourceData)
        .eq('id', editingSource.id)

      if (error) {
        console.error('Error updating income source:', error)
        alert('Failed to update income source')
      }
    } else {
      const { error } = await supabase
        .from('income_sources')
        .insert(sourceData)

      if (error) {
        console.error('Error creating income source:', error)
        alert('Failed to create income source')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingSource) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', deletingSource.id)

    if (error) {
      console.error('Error deleting income source:', error)
      alert('Failed to delete income source')
    }

    setDeleteDialogOpen(false)
    setDeletingSource(null)
    fetchData()
  }

  function getMonthlyEquivalent(amount: number, frequency: Frequency): number {
    switch (frequency) {
      case 'weekly':
        return amount * 52 / 12
      case 'monthly':
        return amount
      case 'one-time':
        return amount / 12
      case 'variable':
        return amount // Treat as monthly estimate
      default:
        return amount
    }
  }

  const totalMonthlyIncome = incomeSources
    .filter(s => s.is_active)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.amount, s.frequency), 0)

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
            <DollarSign className="h-6 w-6" />
            Income Sources
          </h1>
          <p className="text-muted-foreground">
            Manage income streams for each household member
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={persons.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSource ? 'Edit Income Source' : 'Add Income Source'}
              </DialogTitle>
              <DialogDescription>
                {editingSource
                  ? 'Update the details for this income source'
                  : 'Add a new income source for a household member'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="person">Person</Label>
                <Select
                  value={formData.person_id}
                  onValueChange={(value) => setFormData({ ...formData, person_id: value })}
                >
                  <SelectTrigger id="person">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: person.color }}
                          />
                          {person.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Salary, Freelance Work"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: Frequency) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive sources won't be included in calculations
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name || !formData.person_id}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingSource ? 'Save Changes' : 'Add Income'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {persons.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You need to add household members before adding income sources.
            </p>
            <Button variant="link" className="mt-2" asChild>
              <a href="/manage/members">Add Members →</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Monthly Income</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalMonthlyIncome)}</CardTitle>
          </CardHeader>
        </Card>
        {persons.map((person) => {
          const personIncome = incomeSources
            .filter(s => s.person_id === person.id && s.is_active)
            .reduce((sum, s) => sum + getMonthlyEquivalent(s.amount, s.frequency), 0)
          const percentage = totalMonthlyIncome > 0 ? Math.round((personIncome / totalMonthlyIncome) * 100) : 0
          
          return (
            <Card key={person.id}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  {person.name}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(personIncome)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({percentage}%)
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>
            {incomeSources.length} income source{incomeSources.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incomeSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No income sources yet. Add your first income source to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Monthly Equiv.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeSources.map((source) => (
                  <TableRow key={source.id} className={!source.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: (source as any).person?.color }}
                        />
                        {(source as any).person?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(source.amount)}
                      <span className="text-xs text-muted-foreground ml-1">
                        /{source.frequency}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(getMonthlyEquivalent(source.amount, source.frequency))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={source.is_active ? 'default' : 'secondary'}>
                        {source.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(source)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingSource(source)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSource?.name}"? This action cannot be undone.
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
