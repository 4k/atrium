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
import { PieChart, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Person = Database['public']['Tables']['persons']['Row']
type BudgetCategory = Database['public']['Tables']['budget_categories']['Row']

const iconOptions = ['🏠', '⚡', '🛒', '🛡️', '💻', '💼', '📚', '💅', '🚗', '🍔', '🎮', '👗', '🏥', '🎁', '✈️', '📋']
const colorOptions = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899']

export default function BudgetPage() {
  const [categories, setCategories] = useState<(BudgetCategory & { person?: Person })[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<BudgetCategory | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const [formData, setFormData] = useState({
    name: '',
    budgeted: 0,
    spent: 0,
    icon: '📋',
    color: '#3b82f6',
    person_id: '' as string | null,
  })

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

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

    // Fetch budget categories for selected month
    const monthDate = `${selectedMonth}-01`
    const { data, error } = await supabase
      .from('budget_categories')
      .select(`
        *,
        person:persons(*)
      `)
      .eq('household_id', hId)
      .eq('month', monthDate)
      .order('created_at')

    if (error) {
      console.error('Error fetching budget categories:', error)
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingCategory(null)
    setFormData({
      name: '',
      budgeted: 0,
      spent: 0,
      icon: '📋',
      color: '#3b82f6',
      person_id: null,
    })
    setDialogOpen(true)
  }

  function openEditDialog(category: BudgetCategory) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      budgeted: category.budgeted,
      spent: category.spent,
      icon: category.icon || '📋',
      color: category.color || '#3b82f6',
      person_id: category.person_id,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()
    const monthDate = `${selectedMonth}-01`

    const categoryData = {
      household_id: householdId,
      name: formData.name,
      budgeted: formData.budgeted,
      spent: formData.spent,
      icon: formData.icon,
      color: formData.color,
      person_id: formData.person_id || null,
      month: monthDate,
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('budget_categories')
        .update(categoryData)
        .eq('id', editingCategory.id)

      if (error) {
        console.error('Error updating category:', error)
        alert('Failed to update category')
      }
    } else {
      const { error } = await supabase
        .from('budget_categories')
        .insert(categoryData)

      if (error) {
        console.error('Error creating category:', error)
        alert('Failed to create category')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingCategory) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', deletingCategory.id)

    if (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }

    setDeleteDialogOpen(false)
    setDeletingCategory(null)
    fetchData()
  }

  async function copyFromPreviousMonth() {
    if (!householdId) return
    
    const supabase = createClient()
    const currentMonthDate = `${selectedMonth}-01`
    
    // Get previous month
    const [year, month] = selectedMonth.split('-').map(Number)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevMonthDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`

    // Fetch categories from previous month
    const { data: prevCategories, error: fetchError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('household_id', householdId)
      .eq('month', prevMonthDate)

    if (fetchError || !prevCategories?.length) {
      alert('No categories found in previous month')
      return
    }

    // Insert copies for current month (with spent reset to 0)
    const newCategories = prevCategories.map(cat => ({
      household_id: cat.household_id,
      name: cat.name,
      budgeted: cat.budgeted,
      spent: 0,
      icon: cat.icon,
      color: cat.color,
      person_id: cat.person_id,
      month: currentMonthDate,
    }))

    const { error: insertError } = await supabase
      .from('budget_categories')
      .insert(newCategories)

    if (insertError) {
      console.error('Error copying categories:', insertError)
      alert('Failed to copy categories')
    } else {
      fetchData()
    }
  }

  const totalBudgeted = categories.reduce((sum, c) => sum + c.budgeted, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)
  const overallProgress = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0

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
            <PieChart className="h-6 w-6" />
            Budget Categories
          </h1>
          <p className="text-muted-foreground">
            Set and track monthly spending budgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? 'Update the details for this budget category'
                    : 'Add a new budget category for ' + selectedMonth}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Groceries, Utilities"
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
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 transition-all',
                          formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgeted">Budget Amount</Label>
                    <Input
                      id="budgeted"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.budgeted}
                      onChange={(e) => setFormData({ ...formData, budgeted: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spent">Spent Amount</Label>
                    <Input
                      id="spent"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.spent}
                      onChange={(e) => setFormData({ ...formData, spent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person">Assigned To</Label>
                  <Select
                    value={formData.person_id || 'shared'}
                    onValueChange={(value) => setFormData({ ...formData, person_id: value === 'shared' ? null : value })}
                  >
                    <SelectTrigger id="person">
                      <SelectValue placeholder="Select..." />
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving || !formData.name}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budgeted</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalBudgeted)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className={cn('text-2xl', totalSpent > totalBudgeted && 'text-red-500')}>
              {formatCurrency(totalSpent)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget Usage</CardDescription>
            <CardTitle className="text-2xl">{overallProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(overallProgress, 100)} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories for {new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</CardTitle>
              <CardDescription>
                {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
              </CardDescription>
            </div>
            {categories.length === 0 && (
              <Button variant="outline" onClick={copyFromPreviousMonth}>
                Copy from Previous Month
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No budget categories for this month.</p>
              <p className="text-sm mt-1">Add categories or copy from previous month.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Budgeted</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const progress = category.budgeted > 0 
                    ? Math.round((category.spent / category.budgeted) * 100) 
                    : 0
                  const isOver = category.spent > category.budgeted
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <span>{category.icon || '📋'}</span>
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.person_id ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: (category as any).person?.color }}
                            />
                            {(category as any).person?.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Shared</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(category.budgeted)}</TableCell>
                      <TableCell className={cn(isOver && 'text-red-500 font-medium')}>
                        {formatCurrency(category.spent)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress 
                            value={Math.min(progress, 100)} 
                            className={cn('h-2 flex-1', isOver && '[&>div]:bg-red-500')}
                          />
                          <span className={cn('text-xs w-10', isOver && 'text-red-500')}>
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingCategory(category)
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
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
