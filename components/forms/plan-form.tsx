'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification';
import { plansApi } from '@/lib/api';
import type { Plan } from '@/lib/types';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: Plan | null;
}

export function PlanForm({ isOpen, onClose, onSuccess, plan }: PlanFormProps) {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plan_name: '',
    duration_months: '1',
    admission_fee: '0',
    plan_fee: '0',
    total_fee: '0',
    pause_days_allowed: '0',
    description: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when plan prop changes
  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name || '',
        duration_months: plan.duration_months?.toString() || '1',
        admission_fee: plan.admission_fee?.toString() || '0',
        plan_fee: plan.plan_fee?.toString() || '0',
        total_fee: plan.total_fee?.toString() || '0',
        pause_days_allowed: plan.pause_days_allowed?.toString() || '0',
        description: plan.description || '',
        is_active: plan.is_active ?? true,
      });
    } else {
      // Reset form for new plan
      setFormData({
        plan_name: '',
        duration_months: '1',
        admission_fee: '0',
        plan_fee: '0',
        total_fee: '0',
        pause_days_allowed: '0',
        description: '',
        is_active: true,
      });
    }
    // Clear errors when plan changes
    setErrors({});
  }, [plan, isOpen]);

  // Auto-calculate total fee when admission fee or plan fee changes
  useEffect(() => {
    const admissionFee = Number(formData.admission_fee) || 0;
    const planFee = Number(formData.plan_fee) || 0;
    const totalFee = admissionFee + planFee;
    
    setFormData(prev => ({
      ...prev,
      total_fee: totalFee.toString()
    }));
  }, [formData.admission_fee, formData.plan_fee]);

  // Auto-set pause days based on duration
  useEffect(() => {
    const duration = Number(formData.duration_months);
    let pauseDays = 0;
    
    if (duration <= 1) pauseDays = 0;
    else if (duration <= 2) pauseDays = 0;
    else if (duration <= 3) pauseDays = 15;
    else if (duration <= 6) pauseDays = 20;
    else pauseDays = 30;
    
    setFormData(prev => ({
      ...prev,
      pause_days_allowed: pauseDays.toString()
    }));
  }, [formData.duration_months]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.plan_name.trim()) {
      newErrors.plan_name = 'Plan name is required';
    }

    const duration = Number(formData.duration_months);
    if (!duration || duration <= 0) {
      newErrors.duration_months = 'Duration must be greater than 0';
    }

    const admissionFee = Number(formData.admission_fee);
    if (isNaN(admissionFee) || admissionFee < 0) {
      newErrors.admission_fee = 'Admission fee must be a valid number';
    }

    const planFee = Number(formData.plan_fee);
    if (isNaN(planFee) || planFee < 0) {
      newErrors.plan_fee = 'Plan fee must be a valid number';
    }

    const pauseDays = Number(formData.pause_days_allowed);
    if (isNaN(pauseDays) || pauseDays < 0) {
      newErrors.pause_days_allowed = 'Pause days must be a valid number';
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
        plan_name: formData.plan_name,
        duration_months: Number(formData.duration_months),
        admission_fee: Number(formData.admission_fee),
        plan_fee: Number(formData.plan_fee),
        total_fee: Number(formData.total_fee),
        pause_days_allowed: Number(formData.pause_days_allowed),
        description: formData.description || null,
        is_active: formData.is_active,
      };

      if (plan) {
        await plansApi.update(plan.id, submitData);
        success('Plan Updated', 'Plan has been updated successfully');
      } else {
        await plansApi.create(submitData);
        success('Plan Created', 'New plan has been created successfully');
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
      if (!plan) {
        setFormData({
          plan_name: '',
          duration_months: '1',
          admission_fee: '0',
          plan_fee: '0',
          total_fee: '0',
          pause_days_allowed: '0',
          description: '',
          is_active: true,
        });
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={plan ? 'Edit Plan' : 'Create New Plan'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Plan Name *"
            value={formData.plan_name}
            onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
            error={errors.plan_name}
            disabled={loading}
            placeholder="e.g., 3 Month Basic"
          />

          <Select
            label="Duration (Months) *"
            value={formData.duration_months}
            onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
            options={[
              { value: '1', label: '1 Month' },
              { value: '2', label: '2 Months' },
              { value: '3', label: '3 Months' },
              { value: '6', label: '6 Months' },
              { value: '12', label: '12 Months' },
            ]}
            error={errors.duration_months}
            disabled={loading}
          />

          <Input
            label="Admission Fee (₹) *"
            type="number"
            value={formData.admission_fee}
            onChange={(e) => setFormData({ ...formData, admission_fee: e.target.value })}
            error={errors.admission_fee}
            disabled={loading}
            min="0"
            step="0.01"
          />

          <Input
            label="Plan Fee (₹) *"
            type="number"
            value={formData.plan_fee}
            onChange={(e) => setFormData({ ...formData, plan_fee: e.target.value })}
            error={errors.plan_fee}
            disabled={loading}
            min="0"
            step="0.01"
          />

          <Input
            label="Total Fee (₹)"
            type="number"
            value={formData.total_fee}
            disabled={true}
            helperText="Auto-calculated from admission + plan fee"
          />

          <Input
            label="Pause Days Allowed"
            type="number"
            value={formData.pause_days_allowed}
            onChange={(e) => setFormData({ ...formData, pause_days_allowed: e.target.value })}
            error={errors.pause_days_allowed}
            disabled={loading}
            min="0"
            helperText="Auto-set based on duration"
          />
        </div>

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          placeholder="Brief description of the plan features"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            disabled={loading}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Plan is active and available for new subscriptions
          </label>
        </div>

        {/* Plan Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Plan Preview</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Duration: {formData.duration_months} month(s)</div>
            <div>Pause Days: {formData.pause_days_allowed}</div>
            <div>Admission: ₹{Number(formData.admission_fee || 0).toLocaleString()}</div>
            <div>Plan Fee: ₹{Number(formData.plan_fee || 0).toLocaleString()}</div>
            <div className="col-span-2 font-medium">
              Total: ₹{Number(formData.total_fee || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}