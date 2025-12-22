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
import { PiggyBank, Plus, Pencil, Trash2, Loader2, AlertTriangle, Calendar } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type SinkingFund = Database['public']['Tables']['sinking_funds']['Row']
type Category = SinkingFund['category']

const categoryOptions: { value: Category; label: string; icon: string }[] = [
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'medical', label: 'Medical & Dental', icon: '🏥' },
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'holiday', label: 'Holiday', icon: '🎄' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'other', label: 'Other', icon: '📋' },
]

const iconOptions = ['🛡️', '🏥', '🚗', '🏠', '🎄', '🎓', '🎂', '🔌', '🔧', '✈️', '💍', '📋']

export default function SinkingFundsPage() {
  const [funds, setFunds] = useState<SinkingFund[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingFund, setEditingFund] = useState<SinkingFund | null>(null)
  const [deletingFund, setDeletingFund] = useState<SinkingFund | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as Category,
    icon: '📋',
    target_amount: 0,
    current_amount: 0,
    due_date: '',
    monthly_contribution: 0,
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

    const { data, error } = await supabase
      .from('sinking_funds')
      .select('*')
      .eq('household_id', hId)
      .order('due_date')

    if (error) {
      console.error('Error fetching funds:', error)
    } else {
      setFunds(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingFund(null)
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    
    setFormData({
      name: '',
      category: 'other',
      icon: '📋',
      target_amount: 1000,
      current_amount: 0,
      due_date: nextYear.toISOString().split('T')[0],
      monthly_contribution: 0,
    })
    setDialogOpen(true)
  }

  function openEditDialog(fund: SinkingFund) {
    setEditingFund(fund)
    setFormData({
      name: fund.name,
      category: fund.category,
      icon: fund.icon || '📋',
      target_amount: fund.target_amount,
      current_amount: fund.current_amount,
      due_date: fund.due_date,
      monthly_contribution: fund.monthly_contribution,
    })
    setDialogOpen(true)
  }

  function calculateMonthlyContribution() {
    if (!formData.due_date || !formData.target_amount) return
    
    const dueDate = new Date(formData.due_date)
    const now = new Date()
    const monthsRemaining = Math.max(1, 
      (dueDate.getFullYear() - now.getFullYear()) * 12 + 
      (dueDate.getMonth() - now.getMonth())
    )
    
    const amountNeeded = formData.target_amount - formData.current_amount
    const monthlyContribution = Math.ceil(amountNeeded / monthsRemaining)
    
    setFormData({ ...formData, monthly_contribution: Math.max(0, monthlyContribution) })
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const fundData = {
      household_id: householdId,
      name: formData.name,
      category: formData.category,
      icon: formData.icon,
      target_amount: formData.target_amount,
      current_amount: formData.current_amount,
      due_date: formData.due_date,
      monthly_contribution: formData.monthly_contribution,
    }

    if (editingFund) {
      const { error } = await supabase
        .from('sinking_funds')
        .update(fundData)
        .eq('id', editingFund.id)

      if (error) {
        console.error('Error updating fund:', error)
        alert('Failed to update fund')
      }
    } else {
      const { error } = await supabase
        .from('sinking_funds')
        .insert(fundData)

      if (error) {
        console.error('Error creating fund:', error)
        alert('Failed to create fund')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingFund) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('sinking_funds')
      .delete()
      .eq('id', deletingFund.id)

    if (error) {
      console.error('Error deleting fund:', error)
      alert('Failed to delete fund')
    }

    setDeleteDialogOpen(false)
    setDeletingFund(null)
    fetchData()
  }

  function isUnderfunded(fund: SinkingFund): boolean {
    const dueDate = new Date(fund.due_date)
    const now = new Date()
    const monthsRemaining = Math.max(1, 
      (dueDate.getFullYear() - now.getFullYear()) * 12 + 
      (dueDate.getMonth() - now.getMonth())
    )
    const expectedProgress = (fund.target_amount / monthsRemaining) * monthsRemaining
    return fund.current_amount < expectedProgress * 0.8 // 80% of expected
  }

  const totalTarget = funds.reduce((sum, f) => sum + f.target_amount, 0)
  const totalCurrent = funds.reduce((sum, f) => sum + f.current_amount, 0)
  const totalMonthly = funds.reduce((sum, f) => sum + f.monthly_contribution, 0)
  const underfundedCount = funds.filter(isUnderfunded).length

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
            <PiggyBank className="h-6 w-6" />
            Sinking Funds
          </h1>
          <p className="text-muted-foreground">
            Plan for irregular annual expenses
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFund ? 'Edit Sinking Fund' : 'Add Sinking Fund'}
              </DialogTitle>
              <DialogDescription>
                {editingFund
                  ? 'Update the details for this sinking fund'
                  : 'Create a new sinking fund for irregular expenses'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="name">Fund Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Car Insurance, Property Tax"
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
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: Category) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          {cat.icon} {cat.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    min={0}
                    step={10}
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_amount">Current Amount</Label>
                  <Input
                    id="current_amount"
                    type="number"
                    min={0}
                    step={10}
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly_contribution">Monthly Contribution</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calculateMonthlyContribution}
                  >
                    Calculate
                  </Button>
                </div>
                <Input
                  id="monthly_contribution"
                  type="number"
                  min={0}
                  step={5}
                  value={formData.monthly_contribution}
                  onChange={(e) => setFormData({ ...formData, monthly_contribution: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Click "Calculate" to auto-calculate based on target and due date
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingFund ? 'Save Changes' : 'Add Fund'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Target</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalTarget)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Saved</CardDescription>
            <CardTitle className="text-2xl text-green-500">{formatCurrency(totalCurrent)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Total</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalMonthly)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={underfundedCount > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>Underfunded</CardDescription>
            <CardTitle className={cn('text-2xl', underfundedCount > 0 && 'text-amber-500')}>
              {underfundedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sinking Funds</CardTitle>
          <CardDescription>
            {funds.length} fund{funds.length !== 1 ? 's' : ''} tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {funds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sinking funds yet. Add one to start planning for irregular expenses.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((fund) => {
                  const progress = fund.target_amount > 0
                    ? Math.round((fund.current_amount / fund.target_amount) * 100)
                    : 0
                  const underfunded = isUnderfunded(fund)
                  const dueDate = new Date(fund.due_date)

                  return (
                    <TableRow key={fund.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{fund.icon || '📋'}</span>
                          <div>
                            <p className="font-medium">{fund.name}</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {fund.category}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {dueDate.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[150px]">
                          <p className="text-sm mb-1">
                            {formatCurrency(fund.current_amount)} / {formatCurrency(fund.target_amount)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(progress, 100)} 
                              className={cn('h-2 flex-1', progress >= 100 && '[&>div]:bg-green-500')}
                            />
                            <span className="text-xs w-10">{progress}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(fund.monthly_contribution)}
                      </TableCell>
                      <TableCell>
                        {underfunded ? (
                          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Behind
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                            On Track
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(fund)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingFund(fund)
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
            <AlertDialogTitle>Delete Sinking Fund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFund?.name}"? This action cannot be undone.
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
