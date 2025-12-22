/**
 * Database type definitions for Supabase
 *
 * This file can be regenerated using:
 * npm run types:generate
 *
 * Or manually with:
 * npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      persons: {
        Row: {
          id: string
          household_id: string
          name: string
          initials: string
          color: string
          avatar: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          initials: string
          color: string
          avatar?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          initials?: string
          color?: string
          avatar?: string | null
          created_at?: string
        }
      }
      income_sources: {
        Row: {
          id: string
          person_id: string
          name: string
          amount: number
          frequency: 'monthly' | 'weekly' | 'one-time' | 'variable'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          name: string
          amount: number
          frequency: 'monthly' | 'weekly' | 'one-time' | 'variable'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          name?: string
          amount?: number
          frequency?: 'monthly' | 'weekly' | 'one-time' | 'variable'
          is_active?: boolean
          created_at?: string
        }
      }
      pockets: {
        Row: {
          id: string
          household_id: string
          name: string
          icon: string | null
          type: 'bills' | 'spending' | 'savings' | 'sinking' | 'personal' | 'groceries' | 'emergency' | 'vacation' | 'investment' | 'home'
          owner_id: string | null
          current_balance: number
          monthly_allocation: number | null
          target_amount: number | null
          target_date: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          icon?: string | null
          type: 'bills' | 'spending' | 'savings' | 'sinking' | 'personal' | 'groceries' | 'emergency' | 'vacation' | 'investment' | 'home'
          owner_id?: string | null
          current_balance?: number
          monthly_allocation?: number | null
          target_amount?: number | null
          target_date?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          icon?: string | null
          type?: 'bills' | 'spending' | 'savings' | 'sinking' | 'personal' | 'groceries' | 'emergency' | 'vacation' | 'investment' | 'home'
          owner_id?: string | null
          current_balance?: number
          monthly_allocation?: number | null
          target_amount?: number | null
          target_date?: string | null
          color?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          pocket_id: string
          person_id: string
          amount: number
          description: string
          category: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          pocket_id: string
          person_id: string
          amount: number
          description: string
          category?: string | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          pocket_id?: string
          person_id?: string
          amount?: number
          description?: string
          category?: string | null
          transaction_date?: string
          created_at?: string
        }
      }
      contributions: {
        Row: {
          id: string
          household_id: string
          person_id: string
          amount: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          person_id: string
          amount: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          person_id?: string
          amount?: number
          month?: string
          created_at?: string
        }
      }
      personal_allowances: {
        Row: {
          id: string
          person_id: string
          monthly_amount: number
          current_month_spent: number
          rollover_balance: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          monthly_amount: number
          current_month_spent?: number
          rollover_balance?: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          monthly_amount?: number
          current_month_spent?: number
          rollover_balance?: number
          month?: string
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          household_id: string
          pocket_id: string | null
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          pocket_id?: string | null
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          pocket_id?: string | null
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          household_id: string
          name: string
          budgeted: number
          spent: number
          icon: string | null
          color: string | null
          person_id: string | null
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          budgeted?: number
          spent?: number
          icon?: string | null
          color?: string | null
          person_id?: string | null
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          budgeted?: number
          spent?: number
          icon?: string | null
          color?: string | null
          person_id?: string | null
          month?: string
          created_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          household_id: string
          name: string
          amount: number
          due_date: string
          frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time'
          is_autopay: boolean
          category: string | null
          is_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          amount: number
          due_date: string
          frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time'
          is_autopay?: boolean
          category?: string | null
          is_paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          amount?: number
          due_date?: string
          frequency?: 'monthly' | 'quarterly' | 'yearly' | 'one-time'
          is_autopay?: boolean
          category?: string | null
          is_paid?: boolean
          created_at?: string
        }
      }
      children: {
        Row: {
          id: string
          household_id: string
          name: string
          age: number
          avatar: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          age: number
          avatar?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          age?: number
          avatar?: string | null
          color?: string | null
          created_at?: string
        }
      }
      child_expenses: {
        Row: {
          id: string
          child_id: string
          category: 'education' | 'activities' | 'clothing' | 'healthcare' | 'toys' | 'food' | 'other'
          budgeted: number
          spent: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          category: 'education' | 'activities' | 'clothing' | 'healthcare' | 'toys' | 'food' | 'other'
          budgeted?: number
          spent?: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          category?: 'education' | 'activities' | 'clothing' | 'healthcare' | 'toys' | 'food' | 'other'
          budgeted?: number
          spent?: number
          month?: string
          created_at?: string
        }
      }
      sinking_funds: {
        Row: {
          id: string
          household_id: string
          name: string
          category: 'insurance' | 'medical' | 'car' | 'home' | 'holiday' | 'education' | 'other'
          target_amount: number
          current_amount: number
          due_date: string
          monthly_contribution: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          category: 'insurance' | 'medical' | 'car' | 'home' | 'holiday' | 'education' | 'other'
          target_amount: number
          current_amount?: number
          due_date: string
          monthly_contribution?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          category?: 'insurance' | 'medical' | 'car' | 'home' | 'holiday' | 'education' | 'other'
          target_amount?: number
          current_amount?: number
          due_date?: string
          monthly_contribution?: number
          created_at?: string
        }
      }
      gift_recipients: {
        Row: {
          id: string
          household_id: string
          name: string
          relationship: 'family' | 'friend' | 'coworker' | 'other'
          occasion: string
          occasion_date: string
          budgeted: number
          spent: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          relationship: 'family' | 'friend' | 'coworker' | 'other'
          occasion: string
          occasion_date: string
          budgeted?: number
          spent?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          relationship?: 'family' | 'friend' | 'coworker' | 'other'
          occasion?: string
          occasion_date?: string
          budgeted?: number
          spent?: number
          created_at?: string
        }
      }
      travel_plans: {
        Row: {
          id: string
          household_id: string
          destination: string
          start_date: string
          end_date: string
          flights_budgeted: number
          flights_spent: number
          accommodation_budgeted: number
          accommodation_spent: number
          food_budgeted: number
          food_spent: number
          activities_budgeted: number
          activities_spent: number
          transport_budgeted: number
          transport_spent: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          destination: string
          start_date: string
          end_date: string
          flights_budgeted?: number
          flights_spent?: number
          accommodation_budgeted?: number
          accommodation_spent?: number
          food_budgeted?: number
          food_spent?: number
          activities_budgeted?: number
          activities_spent?: number
          transport_budgeted?: number
          transport_spent?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          destination?: string
          start_date?: string
          end_date?: string
          flights_budgeted?: number
          flights_spent?: number
          accommodation_budgeted?: number
          accommodation_spent?: number
          food_budgeted?: number
          food_spent?: number
          activities_budgeted?: number
          activities_spent?: number
          transport_budgeted?: number
          transport_spent?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
