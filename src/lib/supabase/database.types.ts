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
          payday: number
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          initials: string
          color: string
          avatar?: string | null
          payday?: number
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          initials?: string
          color?: string
          avatar?: string | null
          payday?: number
          email?: string | null
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
          expected_amount: number
          actual_amount: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          person_id: string
          expected_amount?: number
          actual_amount: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          person_id?: string
          expected_amount?: number
          actual_amount?: number
          month?: string
          created_at?: string
        }
      }
      contribution_config: {
        Row: {
          id: string
          household_id: string
          person_id: string
          is_percentage_based: boolean
          expected_percentage: number | null
          fixed_amount: number | null
          joint_contribution_target: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          person_id: string
          is_percentage_based?: boolean
          expected_percentage?: number | null
          fixed_amount?: number | null
          joint_contribution_target?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          person_id?: string
          is_percentage_based?: boolean
          expected_percentage?: number | null
          fixed_amount?: number | null
          joint_contribution_target?: number | null
          created_at?: string
          updated_at?: string
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
      personal_allowance_config: {
        Row: {
          id: string
          person_id: string
          default_monthly_amount: number
          allow_rollover: boolean
          allow_borrowing: boolean
          max_borrow_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          default_monthly_amount?: number
          allow_rollover?: boolean
          allow_borrowing?: boolean
          max_borrow_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          default_monthly_amount?: number
          allow_rollover?: boolean
          allow_borrowing?: boolean
          max_borrow_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      monthly_targets_config: {
        Row: {
          id: string
          household_id: string
          income_target: number
          savings_rate_target: number
          budget_adherence_target: number
          next_milestone_name: string | null
          next_milestone_target: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          income_target?: number
          savings_rate_target?: number
          budget_adherence_target?: number
          next_milestone_name?: string | null
          next_milestone_target?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          income_target?: number
          savings_rate_target?: number
          budget_adherence_target?: number
          next_milestone_name?: string | null
          next_milestone_target?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      household_access: {
        Row: {
          id: string
          household_id: string
          user_email: string
          user_id: string | null
          role: 'admin' | 'editor' | 'viewer'
          is_active: boolean
          linked_person_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_email: string
          user_id?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          is_active?: boolean
          linked_person_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_email?: string
          user_id?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          is_active?: boolean
          linked_person_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      account_balance: {
        Row: {
          id: string
          household_id: string
          current_balance: number
          previous_balance: number
          last_synced: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          current_balance?: number
          previous_balance?: number
          last_synced?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          current_balance?: number
          previous_balance?: number
          last_synced?: string | null
          created_at?: string
          updated_at?: string
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
          icon: string | null
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
          icon?: string | null
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
          icon?: string | null
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
          name: string | null
          icon: string | null
          budgeted: number
          spent: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          category: 'education' | 'activities' | 'clothing' | 'healthcare' | 'toys' | 'food' | 'other'
          name?: string | null
          icon?: string | null
          budgeted?: number
          spent?: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          category?: 'education' | 'activities' | 'clothing' | 'healthcare' | 'toys' | 'food' | 'other'
          name?: string | null
          icon?: string | null
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
          icon: string | null
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
          icon?: string | null
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
          icon?: string | null
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
          ideas: string[] | null
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
          ideas?: string[] | null
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
          ideas?: string[] | null
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
          status: 'planning' | 'booked' | 'completed' | 'cancelled'
          total_saved: number
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
          status?: 'planning' | 'booked' | 'completed' | 'cancelled'
          total_saved?: number
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
          status?: 'planning' | 'booked' | 'completed' | 'cancelled'
          total_saved?: number
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
      // Settings tables from migration 20250101000003
      household_settings: {
        Row: {
          id: string
          household_id: string
          household_name: string | null
          currency: string
          locale: string
          timezone: string
          financial_year_start_month: number
          budget_cycle: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          budget_threshold_under: number
          budget_threshold_near: number
          bill_alert_days_before: number
          bill_overdue_alert_enabled: boolean
          default_savings_target_percentage: number
          emergency_fund_months: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          household_name?: string | null
          currency?: string
          locale?: string
          timezone?: string
          financial_year_start_month?: number
          budget_cycle?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          budget_threshold_under?: number
          budget_threshold_near?: number
          bill_alert_days_before?: number
          bill_overdue_alert_enabled?: boolean
          default_savings_target_percentage?: number
          emergency_fund_months?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          household_name?: string | null
          currency?: string
          locale?: string
          timezone?: string
          financial_year_start_month?: number
          budget_cycle?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          budget_threshold_under?: number
          budget_threshold_near?: number
          bill_alert_days_before?: number
          bill_overdue_alert_enabled?: boolean
          default_savings_target_percentage?: number
          emergency_fund_months?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          household_id: string
          theme: 'light' | 'dark' | 'system'
          compact_view: boolean
          show_budget_percentages: boolean
          show_income_breakdown: boolean
          default_dashboard_tab: string
          email_notifications_enabled: boolean
          bill_reminders_enabled: boolean
          budget_alerts_enabled: boolean
          savings_goal_alerts_enabled: boolean
          decimal_places: number
          use_compact_numbers: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id: string
          theme?: 'light' | 'dark' | 'system'
          compact_view?: boolean
          show_budget_percentages?: boolean
          show_income_breakdown?: boolean
          default_dashboard_tab?: string
          email_notifications_enabled?: boolean
          bill_reminders_enabled?: boolean
          budget_alerts_enabled?: boolean
          savings_goal_alerts_enabled?: boolean
          decimal_places?: number
          use_compact_numbers?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string
          theme?: 'light' | 'dark' | 'system'
          compact_view?: boolean
          show_budget_percentages?: boolean
          show_income_breakdown?: boolean
          default_dashboard_tab?: string
          email_notifications_enabled?: boolean
          bill_reminders_enabled?: boolean
          budget_alerts_enabled?: boolean
          savings_goal_alerts_enabled?: boolean
          decimal_places?: number
          use_compact_numbers?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      component_visibility: {
        Row: {
          id: string
          user_id: string
          household_id: string
          show_account_summary: boolean
          show_income_breakdown: boolean
          show_budget_tracker: boolean
          show_savings_goals: boolean
          show_monthly_targets: boolean
          show_upcoming_bills: boolean
          show_child_expenses: boolean
          show_gift_budget: boolean
          show_travel_budget: boolean
          show_pockets_overview: boolean
          show_contribution_tracker: boolean
          show_personal_allowance: boolean
          show_sinking_funds: boolean
          show_couple_scorecard: boolean
          show_money_flow: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id: string
          show_account_summary?: boolean
          show_income_breakdown?: boolean
          show_budget_tracker?: boolean
          show_savings_goals?: boolean
          show_monthly_targets?: boolean
          show_upcoming_bills?: boolean
          show_child_expenses?: boolean
          show_gift_budget?: boolean
          show_travel_budget?: boolean
          show_pockets_overview?: boolean
          show_contribution_tracker?: boolean
          show_personal_allowance?: boolean
          show_sinking_funds?: boolean
          show_couple_scorecard?: boolean
          show_money_flow?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string
          show_account_summary?: boolean
          show_income_breakdown?: boolean
          show_budget_tracker?: boolean
          show_savings_goals?: boolean
          show_monthly_targets?: boolean
          show_upcoming_bills?: boolean
          show_child_expenses?: boolean
          show_gift_budget?: boolean
          show_travel_budget?: boolean
          show_pockets_overview?: boolean
          show_contribution_tracker?: boolean
          show_personal_allowance?: boolean
          show_sinking_funds?: boolean
          show_couple_scorecard?: boolean
          show_money_flow?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      custom_categories: {
        Row: {
          id: string
          household_id: string
          category_type: 'pocket' | 'budget' | 'child_expense' | 'bill' | 'gift_occasion' | 'travel_expense' | 'sinking_fund'
          name: string
          icon: string | null
          color: string | null
          is_default: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          category_type: 'pocket' | 'budget' | 'child_expense' | 'bill' | 'gift_occasion' | 'travel_expense' | 'sinking_fund'
          name: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          category_type?: 'pocket' | 'budget' | 'child_expense' | 'bill' | 'gift_occasion' | 'travel_expense' | 'sinking_fund'
          name?: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      alert_configurations: {
        Row: {
          id: string
          household_id: string
          alert_type: 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'bill_overdue' | 'low_balance' | 'savings_milestone' | 'contribution_missed'
          enabled: boolean
          threshold_config: Json
          notify_email: boolean
          notify_in_app: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          alert_type: 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'bill_overdue' | 'low_balance' | 'savings_milestone' | 'contribution_missed'
          enabled?: boolean
          threshold_config?: Json
          notify_email?: boolean
          notify_in_app?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          alert_type?: 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'bill_overdue' | 'low_balance' | 'savings_milestone' | 'contribution_missed'
          enabled?: boolean
          threshold_config?: Json
          notify_email?: boolean
          notify_in_app?: boolean
          created_at?: string
          updated_at?: string
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
