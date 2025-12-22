'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Baby, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Child = Database['public']['Tables']['children']['Row']

const colorOptions = [
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
]

const avatarOptions = ['👶', '👧', '👦', '🧒', '👸', '🤴', '🧒🏻', '🧒🏽', '🧒🏿']

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [deletingChild, setDeletingChild] = useState<Child | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    avatar: '👶',
    color: '#ec4899',
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
      .from('children')
      .select('*')
      .eq('household_id', hId)
      .order('created_at')

    if (error) {
      console.error('Error fetching children:', error)
    } else {
      setChildren(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingChild(null)
    setFormData({
      name: '',
      age: 0,
      avatar: '👶',
      color: '#ec4899',
    })
    setDialogOpen(true)
  }

  function openEditDialog(child: Child) {
    setEditingChild(child)
    setFormData({
      name: child.name,
      age: child.age,
      avatar: child.avatar || '👶',
      color: child.color || '#ec4899',
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const childData = {
      household_id: householdId,
      name: formData.name,
      age: formData.age,
      avatar: formData.avatar,
      color: formData.color,
    }

    if (editingChild) {
      const { error } = await supabase
        .from('children')
        .update(childData)
        .eq('id', editingChild.id)

      if (error) {
        console.error('Error updating child:', error)
        alert('Failed to update child')
      }
    } else {
      const { error } = await supabase
        .from('children')
        .insert(childData)

      if (error) {
        console.error('Error creating child:', error)
        alert('Failed to create child')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingChild) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', deletingChild.id)

    if (error) {
      console.error('Error deleting child:', error)
      alert('Failed to delete. They may have associated expense data.')
    }

    setDeleteDialogOpen(false)
    setDeletingChild(null)
    fetchData()
  }

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
            <Baby className="h-6 w-6" />
            Children
          </h1>
          <p className="text-muted-foreground">
            Manage children and track their expenses
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingChild ? 'Edit Child' : 'Add Child'}
              </DialogTitle>
              <DialogDescription>
                {editingChild
                  ? 'Update the details for this child'
                  : 'Add a child to track their expenses'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter child's name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={18}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <Select
                    value={formData.avatar}
                    onValueChange={(value) => setFormData({ ...formData, avatar: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarOptions.map((avatar) => (
                        <SelectItem key={avatar} value={avatar}>
                          <span className="text-xl">{avatar}</span>
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
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        formData.color === color.value
                          ? 'border-foreground scale-110'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingChild ? 'Save Changes' : 'Add Child'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Children</CardTitle>
          <CardDescription>
            {children.length} child{children.length !== 1 ? 'ren' : ''} in your household
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Baby className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No children added yet. Add a child to start tracking their expenses.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: child.color || '#ec4899' }}
                        >
                          {child.avatar || '👶'}
                        </div>
                        <span className="font-medium">{child.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{child.age} years old</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(child)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingChild(child)
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Child Expense Categories</CardTitle>
          <CardDescription>
            The following expense categories are available for tracking child expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { category: 'education', icon: '🏫', label: 'Education' },
              { category: 'activities', icon: '🎨', label: 'Activities' },
              { category: 'clothing', icon: '👗', label: 'Clothing' },
              { category: 'healthcare', icon: '🏥', label: 'Healthcare' },
              { category: 'toys', icon: '🧸', label: 'Toys & Books' },
              { category: 'food', icon: '🍎', label: 'Food & Snacks' },
              { category: 'other', icon: '📋', label: 'Other' },
            ].map((cat) => (
              <div key={cat.category} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm">{cat.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Monthly expense budgets for each child and category can be set and tracked from the dashboard.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Child</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingChild?.name}? This will also delete all their associated expense data. This action cannot be undone.
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
