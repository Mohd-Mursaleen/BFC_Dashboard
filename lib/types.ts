// Type definitions for the gym management system

export interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  address?: string;
  medical_history?: {
    diabetic?: boolean;
    thyroid?: boolean;
    heart_stroke?: boolean;
    high_blood_pressure?: boolean;
    low_blood_pressure?: boolean;
    breathing_difficulty?: boolean;
    back_pain?: boolean;
    joint_problem?: boolean;
    recent_surgery?: boolean;
    prescribed_medication?: boolean;
    other_condition?: boolean;
  } | null;
  status: 'active' | 'inactive' | 'suspended';
  preferred_gym_slot?: '5:30am-7:30am' | '7:30am-9:30am' | '9:30am-11:30am' | '4:00pm-6:00pm' | '6:00pm-8:00pm' | '8:00pm-10:00pm';
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  plan_name: string;
  duration_months: number;
  admission_fee: number;
  plan_fee: number;
  total_fee: number;
  pause_days_allowed: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  actual_end_date?: string;
  total_pause_days_allowed: number;
  pause_days_used: number;
  pause_days_remaining: number;
  is_currently_paused: boolean;
  current_pause_start_date?: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  amount_paid: number;
  payment_mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  receipt_number: string;
  created_at: string;
  updated_at: string;
  member_name?: string;
  plan_name?: string;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  count?: number;
}

export interface DashboardSummary {
  cards: {
    total_members: DashboardCard;
    active_members: DashboardCard;
    monthly_revenue: DashboardCard;
    expiring_soon: DashboardCard;
    popular_plan: DashboardCard;
  };
  quick_stats: {
    total_plans: number;
    male_members: number;
    female_members: number;
    paused_subscriptions: number;
  };
}

export interface DashboardAnalytics {
  active_members: number;
  expiring_soon: {
    count: number;
    subscriptions: Array<{
      subscription_id: string;
      member_id: string;
      end_date: string;
      days_remaining: number;
    }>;
  };
  most_popular_plan: {
    plan_name: string;
    member_count: number;
    all_plans: Record<string, number>;
  };
  monthly_revenue: {
    current_month: number;
    last_month: number;
    percentage_change: number;
    growth: 'increase' | 'decrease';
  };
  plan_distribution: Record<string, number>;
  gender_distribution: {
    male: number;
    female: number;
    not_specified: number;
  };
  subscription_status: {
    active: number;
    paused: number;
    expired: number;
  };
}

export interface SchedulerStatus {
  scheduler_running: boolean;
  auto_resume_interval_hours: number;
  timezone: string;
  status: 'healthy' | 'stopped';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface PauseInfo {
  id: string;
  member_id: string;
  plan_id: string;
  is_currently_paused: boolean;
  pause_days_used: number;
  pause_days_remaining: number;
  total_pause_days_allowed: number;
  current_pause_days?: number;
  total_pause_days_if_resumed_today?: number;
  remaining_pause_days_if_resumed_today?: number;
  current_pause_start_date?: string;
  status: string;
}

export interface AutoResumeResult {
  auto_resumed: number;
  checked: number;
  errors: number;
  timestamp: string;
}