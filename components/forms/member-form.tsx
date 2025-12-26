'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { useNotification } from '@/components/ui/notification';
import { membersApi, type MemberCreateResponse } from '@/lib/api';
import type { Member } from '@/lib/types';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: Member | null;
}

export function MemberForm({ isOpen, onClose, onSuccess, member }: MemberFormProps) {
  const { success, error, warning } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    height: '',
    weight: '',
    address: '',
    preferred_gym_slot: '5:30am-7:30am' as '5:30am-7:30am' | '7:30am-9:30am' | '9:30am-11:30am' | '4:00pm-6:00pm' | '6:00pm-8:00pm' | '8:00pm-10:00pm',
  });

  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Medical history options
  const medicalHistoryOptions = [
    { value: 'diabetic', label: 'Diabetic' },
    { value: 'thyroid', label: 'Thyroid' },
    { value: 'heart_stroke', label: 'Heart or Stroke Condition' },
    { value: 'high_blood_pressure', label: 'High Blood Pressure' },
    { value: 'low_blood_pressure', label: 'Low Blood Pressure' },
    { value: 'breathing_difficulty', label: 'Breathing Difficulty / Asthma' },
    { value: 'back_pain', label: 'Back Pain Problem' },
    { value: 'joint_problem', label: 'Joint Problem' },
    { value: 'recent_surgery', label: 'Recent Surgery (last 6 months)' },
    { value: 'prescribed_medication', label: 'Under Prescribed Medication' },
    { value: 'other_condition', label: 'Other Medical Condition' },
  ];

  // Update form data when member prop changes
  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name || '',
        email: member.email || '',
        phone: member.phone || '',
        date_of_birth: member.date_of_birth || '',
        gender: member.gender || 'male',
        height: member.height?.toString() || '',
        weight: member.weight?.toString() || '',
        address: member.address || '',
        preferred_gym_slot: member.preferred_gym_slot || '5:30am-7:30am',
      });

      // Set medical history from member data
      if (member.medical_history && typeof member.medical_history === 'object') {
        const selectedConditions = Object.entries(member.medical_history)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key);
        setMedicalHistory(selectedConditions);
      } else {
        setMedicalHistory([]);
      }
    } else {
      // Reset form for new member
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'male',
        height: '',
        weight: '',
        address: '',
        preferred_gym_slot: '5:30am-7:30am',
      });
      setMedicalHistory([]);
    }
    // Clear errors when member changes
    setErrors({});
  }, [member, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Date of birth is optional


    if (formData.height && (isNaN(Number(formData.height)) || Number(formData.height) <= 0)) {
      newErrors.height = 'Height must be a positive number';
    }

    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
      newErrors.weight = 'Weight must be a positive number';
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
      // Convert medical history array to object
      const medicalHistoryObj: Record<string, boolean> = {};
      medicalHistoryOptions.forEach(option => {
        medicalHistoryObj[option.value] = medicalHistory.includes(option.value);
      });

      const submitData = {
        ...formData,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        medical_history: Object.keys(medicalHistoryObj).some(key => medicalHistoryObj[key]) ? medicalHistoryObj : null,
      };

      if (member) {
        await membersApi.update(member.id, submitData);
        success('Member Updated', 'Member information has been updated successfully');
      } else {
        const response = await membersApi.create(submitData);
        
        // Simplified toast structure based on WhatsApp notification status
        if (response.notification_sent) {
          // Green toast - both member added and WhatsApp sent
          success('Member Added Successfully', 'WhatsApp message sent');
        } else if (response.whatsapp_error) {
          // Yellow toast - member added but WhatsApp failed
          warning('Member Added Successfully', 'WhatsApp message not sent');
        } else {
          // Red toast - general error
          error('Member Added', 'WhatsApp message failed');
        }
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
      if (!member) {
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          gender: 'male',
          height: '',
          weight: '',
          address: '',
          preferred_gym_slot: '5:30am-7:30am',
        });
        setMedicalHistory([]);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={member ? 'Edit Member' : 'Add New Member'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            error={errors.full_name}
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={loading}
          />

          <Input
            label="Phone Number *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            disabled={loading}
          />

          <Input
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            error={errors.date_of_birth}
            disabled={loading}
          />

          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            disabled={loading}
          />

          <Input
            label="Height (cm)"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            error={errors.height}
            disabled={loading}
          />

          <Input
            label="Weight (kg)"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            error={errors.weight}
            disabled={loading}
          />
        </div>

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={loading}
        />

        <Select
          label="Preferred Gym Slot"
          value={formData.preferred_gym_slot}
          onChange={(e) => setFormData({ ...formData, preferred_gym_slot: e.target.value as any })}
          options={[
            { value: '5:30am-7:30am', label: '5:30am to 7:30am' },
            { value: '7:30am-9:30am', label: '7:30am to 9:30am' },
            { value: '9:30am-11:30am', label: '9:30am to 11:30am' },
            { value: '4:00pm-6:00pm', label: '4:00pm to 6:00pm' },
            { value: '6:00pm-8:00pm', label: '6:00pm to 8:00pm' },
            { value: '8:00pm-10:00pm', label: '8:00pm to 10:00pm' },
          ]}
          disabled={loading}
        />

        {/* Medical History Multi-Select */}
        <div className="md:col-span-2">
          <MultiSelect
            label="Medical History"
            options={medicalHistoryOptions}
            value={medicalHistory}
            onChange={setMedicalHistory}
            placeholder="Select medical conditions (if any)"
            disabled={loading}
            helperText="Select all applicable medical conditions"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            {member ? 'Update Member' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}