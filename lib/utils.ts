// Utility functions for the application

/**
 * Format date to dd/mm/yyyy format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in dd/mm/yyyy format
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format currency to Indian Rupee format
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth string
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Check if a subscription is active
 * @param subscription - Subscription object
 * @returns Boolean indicating if subscription is active
 */
export function isSubscriptionActive(subscription: any): boolean {
  const today = new Date().toISOString().split('T')[0];
  const endDate = subscription.actual_end_date || subscription.end_date;
  
  return !subscription.is_currently_paused && endDate >= today;
}

/**
 * Check if a subscription is expired
 * @param subscription - Subscription object
 * @returns Boolean indicating if subscription is expired
 */
export function isSubscriptionExpired(subscription: any): boolean {
  const today = new Date().toISOString().split('T')[0];
  const endDate = subscription.actual_end_date || subscription.end_date;
  
  return endDate < today;
}