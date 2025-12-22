'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Users, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type Person = Database['public']['Tables']['persons']['Row']

const colorOptions = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
]

export default function MembersPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    initials: '',
    color: '#3b82f6',
    avatar: '',
    payday: 1,
    email: '',
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
      .from('persons')
      .select('*')
      .eq('household_id', hId)
      .order('created_at')

    if (error) {
      console.error('Error fetching persons:', error)
    } else {
      setPersons(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingPerson(null)
    setFormData({
      name: '',
      initials: '',
      color: '#3b82f6',
      avatar: '',
      payday: 1,
      email: '',
    })
    setDialogOpen(true)
  }

  function openEditDialog(person: Person) {
    setEditingPerson(person)
    setFormData({
      name: person.name,
      initials: person.initials,
      color: person.color,
      avatar: person.avatar || '',
      payday: person.payday || 1,
      email: person.email || '',
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)

    const supabase = createClient()

    const personData = {
      household_id: householdId,
      name: formData.name,
      initials: formData.initials || formData.name.substring(0, 2).toUpperCase(),
      color: formData.color,
      avatar: formData.avatar || null,
      payday: formData.payday,
      email: formData.email || null,
    }

    if (editingPerson) {
      const { error } = await supabase
        .from('persons')
        .update(personData)
        .eq('id', editingPerson.id)

      if (error) {
        console.error('Error updating person:', error)
        alert('Failed to update member')
      }
    } else {
      const { error } = await supabase
        .from('persons')
        .insert(personData)

      if (error) {
        console.error('Error creating person:', error)
        alert('Failed to create member')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingPerson) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', deletingPerson.id)

    if (error) {
      console.error('Error deleting person:', error)
      alert('Failed to delete member. They may have associated data.')
    }

    setDeleteDialogOpen(false)
    setDeletingPerson(null)
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
            <Users className="h-6 w-6" />
            Household Members
          </h1>
          <p className="text-muted-foreground">
            Manage the people in your household
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPerson ? 'Edit Member' : 'Add Member'}
              </DialogTitle>
              <DialogDescription>
                {editingPerson
                  ? 'Update the details for this household member'
                  : 'Add a new person to your household'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initials">Initials</Label>
                  <Input
                    id="initials"
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase().substring(0, 2) })}
                    placeholder="e.g., TK"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar (emoji)</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="e.g., 👨"
                  />
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
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-foreground scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payday">Payday (day of month)</Label>
                <Input
                  id="payday"
                  type="number"
                  min={1}
                  max={31}
                  value={formData.payday}
                  onChange={(e) => setFormData({ ...formData, payday: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">
                  Used to calculate days until next paycheck
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="person@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Link this member to their email for identification
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPerson ? 'Save Changes' : 'Add Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {persons.length} member{persons.length !== 1 ? 's' : ''} in your household
          </CardDescription>
        </CardHeader>
        <CardContent>
          {persons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No members yet. Add your first household member to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Payday</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {persons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: person.color }}
                        >
                          {person.avatar || person.initials}
                        </div>
                        <div>
                          <p className="font-medium">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.initials}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {person.payday ? `${person.payday}${getOrdinalSuffix(person.payday)} of month` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {person.email || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(person)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingPerson(person)
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
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingPerson?.name}? This will also delete all their associated data (income sources, allowances, contributions, etc.). This action cannot be undone.
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

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
