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
  emergency_contact_name?: string;
  emergency_contact_number?: string;
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
  need_trainer: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields from list endpoint (limited data)
  member_name?: string;
  member_phone?: string;
  plan_name?: string;
  // Nested objects from detail endpoint (full data)
  member?: Member;
  plan?: Plan;
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
  revenue_history?: Array<{
    month: string;
    revenue: number;
    month_name: string;
    year: number;
  }>;
  member_growth?: Array<{
    month: string;
    new_members: number;
    total_members: number;
    month_name: string;
    year: number;
  }>;
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
  need_trainer?: boolean;
}

export interface AutoResumeResult {
  auto_resumed: number;
  checked: number;
  errors: number;
  timestamp: string;
}

// WhatsApp API Types
export interface WhatsAppTestResponse {
  test_phone: string;
  success?: boolean;
  connection_status: 'success' | 'failed' | 'failed_not_connected' | string;
  status?: string;
  message?: string;
  error?: string;
  details?: {
    success: boolean;
    message_id?: string;
    error?: string;
    status_code?: number;
    response?: any;
  };
}

export interface WhatsAppMessageResponse {
  success: boolean;
  message_id?: string;
  error?: string;
  status_code?: number;
  response?: any;
}

export interface ExpiringSubscription {
  subscription_id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  end_date: string;
  days_remaining: number;
}

export interface ExpiringSubscriptionsResponse {
  days_ahead: number;
  count: number;
  subscriptions: ExpiringSubscription[];
}

export interface ExpiryRemindersResponse {
  success: boolean;
  checked_date: string;
  target_expiry_date: string;
  total_active_subscriptions: number;
  expiring_in_7_days: number;
  notifications_sent: number;
  notifications_failed: number;
}


// WhatsApp Template Types
export interface WhatsAppTemplate {
  name: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: string;
  components?: Array<{
    type: string;
    text?: string;
  }>;
}

export interface WhatsAppTemplatesResponse {
  success: boolean;
  count: number;
  templates: WhatsAppTemplate[];
}

export interface BulkSendRecipient {
  phone: string;
  parameters: Record<string, string>;
}

export interface BulkSendRequest {
  template_name: string;
  language_code: string;
  recipients: BulkSendRecipient[];
}

export interface BulkSendResultItem {
  phone: string;
  success: boolean;
  message_id?: string;
  error?: string;
}

export interface BulkSendResult {
  total: number;
  successful: number;
  failed: number;
  results: BulkSendResultItem[];
}

// Pagination Types
export interface PaginationMetadata {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}
