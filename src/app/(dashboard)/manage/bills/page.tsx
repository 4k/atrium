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
import { Receipt, Plus, Pencil, Trash2, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Bill = Database['public']['Tables']['bills']['Row']
type Frequency = 'monthly' | 'quarterly' | 'yearly' | 'one-time'

const categoryOptions = [
  'Housing',
  'Utilities',
  'Insurance',
  'Subscriptions',
  'Childcare',
  'Transportation',
  'Health',
  'Other',
]

const iconOptions = ['🏠', '⚡', '📡', '💧', '🛡️', '🚗', '👶', '🎵', '📺', '💳', '🏥', '📋']

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    due_date: '',
    frequency: 'monthly' as Frequency,
    category: 'Other',
    icon: '📋',
    is_autopay: false,
    is_paid: false,
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
      .from('bills')
      .select('*')
      .eq('household_id', hId)
      .order('due_date')

    if (error) {
      console.error('Error fetching bills:', error)
    } else {
      setBills(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingBill(null)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)
    
    setFormData({
      name: '',
      amount: 0,
      due_date: nextMonth.toISOString().split('T')[0],
      frequency: 'monthly',
      category: 'Other',
      icon: '📋',
      is_autopay: false,
      is_paid: false,
    })
    setDialogOpen(true)
  }

  function openEditDialog(bill: Bill) {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      amount: bill.amount,
      due_date: bill.due_date,
      frequency: bill.frequency,
      category: bill.category || 'Other',
      icon: bill.icon || '📋',
      is_autopay: bill.is_autopay,
      is_paid: bill.is_paid,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const billData = {
      household_id: householdId,
      name: formData.name,
      amount: formData.amount,
      due_date: formData.due_date,
      frequency: formData.frequency,
      category: formData.category,
      icon: formData.icon,
      is_autopay: formData.is_autopay,
      is_paid: formData.is_paid,
    }

    if (editingBill) {
      const { error } = await supabase
        .from('bills')
        .update(billData)
        .eq('id', editingBill.id)

      if (error) {
        console.error('Error updating bill:', error)
        alert('Failed to update bill')
      }
    } else {
      const { error } = await supabase
        .from('bills')
        .insert(billData)

      if (error) {
        console.error('Error creating bill:', error)
        alert('Failed to create bill')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingBill) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', deletingBill.id)

    if (error) {
      console.error('Error deleting bill:', error)
      alert('Failed to delete bill')
    }

    setDeleteDialogOpen(false)
    setDeletingBill(null)
    fetchData()
  }

  async function togglePaid(bill: Bill) {
    const supabase = createClient()
    const { error } = await supabase
      .from('bills')
      .update({ is_paid: !bill.is_paid })
      .eq('id', bill.id)

    if (error) {
      console.error('Error updating bill:', error)
    } else {
      fetchData()
    }
  }

  const totalMonthly = bills
    .filter(b => b.frequency === 'monthly')
    .reduce((sum, b) => sum + b.amount, 0)
  
  const unpaidBills = bills.filter(b => !b.is_paid)
  const upcomingTotal = unpaidBills.reduce((sum, b) => sum + b.amount, 0)

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
            <Receipt className="h-6 w-6" />
            Bills
          </h1>
          <p className="text-muted-foreground">
            Manage recurring bills and payments
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBill ? 'Edit Bill' : 'Add Bill'}
              </DialogTitle>
              <DialogDescription>
                {editingBill
                  ? 'Update the details for this bill'
                  : 'Add a new recurring bill'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="name">Bill Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rent, Electricity"
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
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_autopay">Auto-pay Enabled</Label>
                  <p className="text-xs text-muted-foreground">
                    This bill is paid automatically
                  </p>
                </div>
                <Switch
                  id="is_autopay"
                  checked={formData.is_autopay}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_autopay: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_paid">Paid</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark this bill as paid
                  </p>
                </div>
                <Switch
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBill ? 'Save Changes' : 'Add Bill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Bills</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalMonthly)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unpaid Bills</CardDescription>
            <CardTitle className="text-2xl text-amber-500">{formatCurrency(upcomingTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{unpaidBills.length} bills pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bills</CardDescription>
            <CardTitle className="text-2xl">{bills.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
          <CardDescription>
            Manage your recurring and one-time bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills yet. Add your first bill to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => {
                  const dueDate = new Date(bill.due_date)
                  const isOverdue = !bill.is_paid && dueDate < new Date()
                  
                  return (
                    <TableRow key={bill.id} className={bill.is_paid ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{bill.icon || '📋'}</span>
                          <div>
                            <p className="font-medium">{bill.name}</p>
                            <p className="text-xs text-muted-foreground">{bill.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(bill.amount)}
                      </TableCell>
                      <TableCell className={cn(isOverdue && 'text-red-500')}>
                        {dueDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">{bill.frequency}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {bill.is_paid ? (
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {bill.is_autopay && (
                            <Badge variant="secondary" className="text-xs">Auto</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaid(bill)}
                        >
                          {bill.is_paid ? 'Unpay' : 'Pay'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(bill)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingBill(bill)
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
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBill?.name}"? This action cannot be undone.
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
