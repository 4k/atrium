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
import { Plane, Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type TravelPlan = Database['public']['Tables']['travel_plans']['Row']
type TravelStatus = TravelPlan['status']

export default function TravelPage() {
  const [plans, setPlans] = useState<TravelPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<TravelPlan | null>(null)

  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    status: 'planning' as TravelStatus,
    total_saved: 0,
    flights_budgeted: 0,
    flights_spent: 0,
    accommodation_budgeted: 0,
    accommodation_spent: 0,
    food_budgeted: 0,
    food_spent: 0,
    activities_budgeted: 0,
    activities_spent: 0,
    transport_budgeted: 0,
    transport_spent: 0,
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
      .from('travel_plans')
      .select('*')
      .eq('household_id', hId)
      .order('start_date')

    if (error) {
      console.error('Error fetching plans:', error)
    } else {
      setPlans(data || [])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingPlan(null)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 3)
    const weekLater = new Date(nextMonth)
    weekLater.setDate(weekLater.getDate() + 7)
    
    setFormData({
      destination: '',
      start_date: nextMonth.toISOString().split('T')[0],
      end_date: weekLater.toISOString().split('T')[0],
      status: 'planning',
      total_saved: 0,
      flights_budgeted: 0,
      flights_spent: 0,
      accommodation_budgeted: 0,
      accommodation_spent: 0,
      food_budgeted: 0,
      food_spent: 0,
      activities_budgeted: 0,
      activities_spent: 0,
      transport_budgeted: 0,
      transport_spent: 0,
    })
    setDialogOpen(true)
  }

  function openEditDialog(plan: TravelPlan) {
    setEditingPlan(plan)
    setFormData({
      destination: plan.destination,
      start_date: plan.start_date,
      end_date: plan.end_date,
      status: plan.status,
      total_saved: plan.total_saved,
      flights_budgeted: plan.flights_budgeted,
      flights_spent: plan.flights_spent,
      accommodation_budgeted: plan.accommodation_budgeted,
      accommodation_spent: plan.accommodation_spent,
      food_budgeted: plan.food_budgeted,
      food_spent: plan.food_spent,
      activities_budgeted: plan.activities_budgeted,
      activities_spent: plan.activities_spent,
      transport_budgeted: plan.transport_budgeted,
      transport_spent: plan.transport_spent,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const planData = {
      household_id: householdId,
      ...formData,
    }

    if (editingPlan) {
      const { error } = await supabase
        .from('travel_plans')
        .update(planData)
        .eq('id', editingPlan.id)

      if (error) {
        console.error('Error updating plan:', error)
        alert('Failed to update plan')
      }
    } else {
      const { error } = await supabase
        .from('travel_plans')
        .insert(planData)

      if (error) {
        console.error('Error creating plan:', error)
        alert('Failed to create plan')
      }
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete() {
    if (!deletingPlan) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', deletingPlan.id)

    if (error) {
      console.error('Error deleting plan:', error)
      alert('Failed to delete plan')
    }

    setDeleteDialogOpen(false)
    setDeletingPlan(null)
    fetchData()
  }

  function getTotalBudget(plan: TravelPlan) {
    return plan.flights_budgeted + plan.accommodation_budgeted + 
           plan.food_budgeted + plan.activities_budgeted + plan.transport_budgeted
  }

  function getTotalSpent(plan: TravelPlan) {
    return plan.flights_spent + plan.accommodation_spent + 
           plan.food_spent + plan.activities_spent + plan.transport_spent
  }

  const totalBudgetAll = plans.reduce((sum, p) => sum + getTotalBudget(p), 0)
  const totalSavedAll = plans.reduce((sum, p) => sum + p.total_saved, 0)

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
            <Plane className="h-6 w-6" />
            Travel Plans
          </h1>
          <p className="text-muted-foreground">
            Plan and budget for upcoming trips
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Travel Plan' : 'Add Travel Plan'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? 'Update the details for this trip'
                  : 'Plan a new trip and set your budget'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., Paris, France"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: TravelStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_saved">Amount Saved</Label>
                <Input
                  id="total_saved"
                  type="number"
                  min={0}
                  step={100}
                  value={formData.total_saved}
                  onChange={(e) => setFormData({ ...formData, total_saved: parseFloat(e.target.value) || 0 })}
                  className="w-40"
                />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Budget Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'flights', label: '✈️ Flights' },
                    { key: 'accommodation', label: '🏨 Accommodation' },
                    { key: 'food', label: '🍽️ Food' },
                    { key: 'activities', label: '🎯 Activities' },
                    { key: 'transport', label: '🚗 Transport' },
                  ].map((category) => (
                    <div key={category.key} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <Label className="text-sm">{category.label}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Budget</span>
                          <Input
                            type="number"
                            min={0}
                            step={10}
                            value={(formData as any)[`${category.key}_budgeted`]}
                            onChange={(e) => setFormData({
                              ...formData,
                              [`${category.key}_budgeted`]: parseFloat(e.target.value) || 0,
                            })}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Spent</span>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={(formData as any)[`${category.key}_spent`]}
                            onChange={(e) => setFormData({
                              ...formData,
                              [`${category.key}_spent`]: parseFloat(e.target.value) || 0,
                            })}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formData.destination}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPlan ? 'Save Changes' : 'Add Trip'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Trip Budgets</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalBudgetAll)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Saved</CardDescription>
            <CardTitle className="text-2xl text-green-500">{formatCurrency(totalSavedAll)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Trips</CardDescription>
            <CardTitle className="text-2xl">
              {plans.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Travel Plans */}
      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No travel plans yet. Start planning your next adventure!</p>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => {
            const totalBudget = getTotalBudget(plan)
            const totalSpent = getTotalSpent(plan)
            const savingsProgress = totalBudget > 0 ? Math.round((plan.total_saved / totalBudget) * 100) : 0
            const spentProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
            const startDate = new Date(plan.start_date)
            const endDate = new Date(plan.end_date)

            return (
              <Card key={plan.id} className={cn(
                plan.status === 'completed' && 'opacity-60',
                plan.status === 'cancelled' && 'opacity-40'
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.destination}
                        <Badge variant={
                          plan.status === 'booked' ? 'default' :
                          plan.status === 'completed' ? 'secondary' :
                          plan.status === 'cancelled' ? 'destructive' : 'outline'
                        } className="capitalize">
                          {plan.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingPlan(plan)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saved</p>
                      <p className="text-xl font-bold text-green-500">{formatCurrency(plan.total_saved)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className={cn(
                        'text-xl font-bold',
                        totalBudget - totalSpent < 0 && 'text-red-500'
                      )}>
                        {formatCurrency(totalBudget - totalSpent)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Savings Progress</span>
                      <span>{savingsProgress}%</span>
                    </div>
                    <Progress value={Math.min(savingsProgress, 100)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Travel Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the trip to "{deletingPlan?.destination}"? This action cannot be undone.
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
