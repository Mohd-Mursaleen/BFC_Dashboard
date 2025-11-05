'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification';
import { subscriptionsApi, membersApi, plansApi } from '@/lib/api';
import type { Subscription, Member, Plan } from '@/lib/types';

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: Subscription | null;
  preSelectedMemberId?: string;
}

export function SubscriptionForm({ isOpen, onClose, onSuccess, subscription, preSelectedMemberId }: SubscriptionFormProps) {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const [formData, setFormData] = useState({
    member_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    amount_paid: '',
    payment_mode: 'cash' as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque',
    receipt_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when subscription prop changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        member_id: subscription.member_id || '',
        plan_id: subscription.plan_id || '',
        start_date: subscription.start_date || new Date().toISOString().split('T')[0],
        end_date: subscription.end_date || '',
        amount_paid: subscription.amount_paid?.toString() || '',
        payment_mode: subscription.payment_mode || 'cash',
        receipt_number: subscription.receipt_number || '',
      });
    } else {
      // Reset form for new subscription
      setFormData({
        member_id: preSelectedMemberId || '',
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        amount_paid: '',
        payment_mode: 'cash' as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque',
        receipt_number: '',
      });
    }
    // Clear errors when subscription changes
    setErrors({});
  }, [subscription, preSelectedMemberId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchPlans();
    }
  }, [isOpen]);

  // Auto-calculate end date when start date or plan changes
  useEffect(() => {
    if (formData.start_date && selectedPlan) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);
      
      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0],
        amount_paid: selectedPlan.total_fee.toString()
      }));
    }
  }, [formData.start_date, selectedPlan]);

  // Update selected plan when plan_id changes
  useEffect(() => {
    const plan = plans.find(p => p.id === formData.plan_id);
    setSelectedPlan(plan || null);
  }, [formData.plan_id, plans]);

  const fetchMembers = async () => {
    try {
      const response = await membersApi.getAll({ status: 'active' });
      setMembers(response);
    } catch (err) {
      error('Failed to load members', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await plansApi.getActive();
      setPlans(response);
    } catch (err) {
      error('Failed to load plans', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.member_id) {
      newErrors.member_id = 'Please select a member';
    }

    if (!formData.plan_id) {
      newErrors.plan_id = 'Please select a plan';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    const amount = Number(formData.amount_paid);
    if (!formData.amount_paid || isNaN(amount) || amount <= 0) {
      newErrors.amount_paid = 'Amount paid must be a positive number';
    }

    if (!formData.receipt_number.trim()) {
      newErrors.receipt_number = 'Receipt number is required';
    }

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        member_id: formData.member_id,
        plan_id: formData.plan_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_pause_days_allowed: selectedPlan?.pause_days_allowed || 0,
        amount_paid: Number(formData.amount_paid),
        payment_mode: formData.payment_mode,
        receipt_number: formData.receipt_number,
      };

      if (subscription) {
        await subscriptionsApi.update(subscription.id, submitData);
        success('Subscription Updated', 'Subscription has been updated successfully');
      } else {
        await subscriptionsApi.create(submitData);
        success('Subscription Created', 'New subscription has been created successfully');
      }

      onSuccess();
      onClose();
    } catch (err) {
      error('Operation Failed', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
      // Reset form data when closing
      if (!subscription) {
        setFormData({
          member_id: preSelectedMemberId || '',
          plan_id: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          amount_paid: '',
          payment_mode: 'cash' as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque',
          receipt_number: '',
        });
      }
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `RCP${timestamp}${random}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={subscription ? 'Edit Subscription' : 'Create New Subscription'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Member *"
            value={formData.member_id}
            onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
            options={[
              { value: '', label: 'Select a member' },
              ...members.map(member => ({
                value: member.id,
                label: `${member.full_name} (${member.email})`
              }))
            ]}
            error={errors.member_id}
            disabled={loading || !!subscription || !!preSelectedMemberId}
            helperText={preSelectedMemberId ? 'Member is pre-selected from the member page' : undefined}
          />

          <Select
            label="Plan *"
            value={formData.plan_id}
            onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
            options={[
              { value: '', label: 'Select a plan' },
              ...plans.map(plan => ({
                value: plan.id,
                label: `${plan.plan_name} - ₹${plan.total_fee.toLocaleString()}`
              }))
            ]}
            error={errors.plan_id}
            disabled={loading}
          />

          <Input
            label="Start Date *"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            error={errors.start_date}
            disabled={loading}
          />

          <Input
            label="End Date *"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            error={errors.end_date}
            disabled={loading}
            helperText="Auto-calculated based on plan duration"
          />

          <Input
            label="Amount Paid (₹) *"
            type="number"
            value={formData.amount_paid}
            onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
            error={errors.amount_paid}
            disabled={loading}
            min="0"
            step="0.01"
          />

          <Select
            label="Payment Mode *"
            value={formData.payment_mode}
            onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value as any })}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'card', label: 'Card' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'cheque', label: 'Cheque' },
            ]}
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          <Input
            label="Receipt Number *"
            value={formData.receipt_number}
            onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
            error={errors.receipt_number}
            disabled={loading}
            placeholder="e.g., RCP001"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({ ...formData, receipt_number: generateReceiptNumber() })}
            disabled={loading}
            className="mt-6"
          >
            Generate
          </Button>
        </div>

        {/* Plan Details Preview */}
        {selectedPlan && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Selected Plan Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div>Duration: {selectedPlan.duration_months} month(s)</div>
              <div>Pause Days: {selectedPlan.pause_days_allowed}</div>
              <div>Admission Fee: ₹{selectedPlan.admission_fee.toLocaleString()}</div>
              <div>Plan Fee: ₹{selectedPlan.plan_fee.toLocaleString()}</div>
              <div className="col-span-2 font-medium">
                Total Fee: ₹{selectedPlan.total_fee.toLocaleString()}
              </div>
              {selectedPlan.description && (
                <div className="col-span-2 text-xs mt-1">
                  {selectedPlan.description}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {subscription ? 'Update Subscription' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}