'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Progress } from '@/components/ui/progress'
import { Gift, Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type GiftRecipient = Database['public']['Tables']['gift_recipients']['Row']
type Relationship = GiftRecipient['relationship']

export default function GiftsPage() {
  const [recipients, setRecipients] = useState<GiftRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<GiftRecipient | null>(null)
  const [deletingRecipient, setDeletingRecipient] = useState<GiftRecipient | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'family' as Relationship,
    occasion: '',
    occasion_date: '',
    budgeted: 0,
    spent: 0,
    ideas: '',
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
      .from('gift_recipients')
      .select('*')
      .eq('household_id', hId)
      .order('occasion_date')

    if (error) {
      console.error('Error fetching recipients:', error)
    } else {
      setRecipients(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingRecipient(null)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    setFormData({
      name: '',
      relationship: 'family',
      occasion: '',
      occasion_date: nextMonth.toISOString().split('T')[0],
      budgeted: 100,
      spent: 0,
      ideas: '',
    })
    setDialogOpen(true)
  }

  function openEditDialog(recipient: GiftRecipient) {
    setEditingRecipient(recipient)
    setFormData({
      name: recipient.name,
      relationship: recipient.relationship,
      occasion: recipient.occasion,
      occasion_date: recipient.occasion_date,
      budgeted: recipient.budgeted,
      spent: recipient.spent,
      ideas: recipient.ideas?.join(', ') || '',
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const recipientData = {
      household_id: householdId,
      name: formData.name,
      relationship: formData.relationship,
      occasion: formData.occasion,
      occasion_date: formData.occasion_date,
      budgeted: formData.budgeted,
      spent: formData.spent,
      ideas: formData.ideas ? formData.ideas.split(',').map(s => s.trim()).filter(Boolean) : null,
    }

    if (editingRecipient) {
      const { error } = await supabase
        .from('gift_recipients')
        .update(recipientData)
        .eq('id', editingRecipient.id)

      if (error) {
        console.error('Error updating recipient:', error)
        alert('Failed to update recipient')
      }
    } else {
      const { error } = await supabase
        .from('gift_recipients')
        .insert(recipientData)

      if (error) {
        console.error('Error creating recipient:', error)
        alert('Failed to create recipient')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingRecipient) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('gift_recipients')
      .delete()
      .eq('id', deletingRecipient.id)

    if (error) {
      console.error('Error deleting recipient:', error)
      alert('Failed to delete recipient')
    }

    setDeleteDialogOpen(false)
    setDeletingRecipient(null)
    fetchData()
  }

  const totalBudgeted = recipients.reduce((sum, r) => sum + r.budgeted, 0)
  const totalSpent = recipients.reduce((sum, r) => sum + r.spent, 0)
  const upcomingCount = recipients.filter(r => new Date(r.occasion_date) >= new Date()).length

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
            <Gift className="h-6 w-6" />
            Gift Recipients
          </h1>
          <p className="text-muted-foreground">
            Plan and track gift budgets for occasions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRecipient ? 'Edit Gift Recipient' : 'Add Gift Recipient'}
              </DialogTitle>
              <DialogDescription>
                {editingRecipient
                  ? 'Update the details for this gift recipient'
                  : 'Add a new gift occasion to track'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mom, Best Friend, Colleague"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value: Relationship) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger id="relationship">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="coworker">Coworker</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Input
                    id="occasion"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    placeholder="e.g., Birthday, Christmas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion_date">Occasion Date</Label>
                <Input
                  id="occasion_date"
                  type="date"
                  value={formData.occasion_date}
                  onChange={(e) => setFormData({ ...formData, occasion_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgeted">Budget</Label>
                  <Input
                    id="budgeted"
                    type="number"
                    min={0}
                    step={10}
                    value={formData.budgeted}
                    onChange={(e) => setFormData({ ...formData, budgeted: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spent">Spent</Label>
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
                <Label htmlFor="ideas">Gift Ideas (comma separated)</Label>
                <Textarea
                  id="ideas"
                  value={formData.ideas}
                  onChange={(e) => setFormData({ ...formData, ideas: e.target.value })}
                  placeholder="e.g., Book, Perfume, Experience voucher"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.name || !formData.occasion}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRecipient ? 'Save Changes' : 'Add Recipient'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Gift Budget</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalBudgeted)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalSpent)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Occasions</CardDescription>
            <CardTitle className="text-2xl">{upcomingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gift Recipients</CardTitle>
          <CardDescription>
            {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gift recipients yet. Add someone to start planning gifts.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient) => {
                  const occasionDate = new Date(recipient.occasion_date)
                  const isPast = occasionDate < new Date()
                  const progress = recipient.budgeted > 0
                    ? Math.round((recipient.spent / recipient.budgeted) * 100)
                    : 0

                  return (
                    <TableRow key={recipient.id} className={isPast ? 'opacity-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {recipient.relationship}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{recipient.occasion}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {occasionDate.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(recipient.budgeted)}</p>
                          <p className="text-xs text-muted-foreground">
                            Spent: {formatCurrency(recipient.spent)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(progress, 100)} 
                              className={cn('h-2 flex-1', progress > 100 && '[&>div]:bg-red-500')}
                            />
                            <span className="text-xs w-10">{progress}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(recipient)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingRecipient(recipient)
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
            <AlertDialogTitle>Delete Gift Recipient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRecipient?.name} - {deletingRecipient?.occasion}"? This action cannot be undone.
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
