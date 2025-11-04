'use client';

import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ id, label, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
      />
      <label 
        htmlFor={id} 
        className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}
      >
        {label}
      </label>
    </div>
  );
}

interface MedicalHistoryCheckboxesProps {
  value: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
  disabled?: boolean;
}

export function MedicalHistoryCheckboxes({ value, onChange, disabled = false }: MedicalHistoryCheckboxesProps) {
  const medicalConditions = [
    { key: 'diabetic', label: 'Diabetic ?' },
    { key: 'thyroid', label: 'Thyroid ?' },
    { key: 'heart_stroke', label: 'Any Heart or Stroke Condition ?' },
    { key: 'high_blood_pressure', label: 'High blood pressure ?' },
    { key: 'low_blood_pressure', label: 'Low blood pressure ?' },
    { key: 'breathing_difficulty', label: 'Any breathing difficulty / asthma ?' },
    { key: 'back_pain', label: 'Back pain problem ?' },
    { key: 'joint_problem', label: 'Do you have any joint problem ?' },
    { key: 'recent_surgery', label: 'Did you undergo any surgery in the last 6 months ?' },
    { key: 'prescribed_medication', label: 'Are you under any prescribed medication ?' },
    { key: 'other_condition', label: 'Any other medical condition that should be made known ?' },
  ];

  const handleConditionChange = (key: string, checked: boolean) => {
    onChange({
      ...value,
      [key]: checked,
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical History</h4>
      <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-lg">
        {medicalConditions.map((condition) => (
          <div key={condition.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 flex-1">{condition.label}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${condition.key}_yes`}
                  name={condition.key}
                  checked={value[condition.key] === true}
                  onChange={() => handleConditionChange(condition.key, true)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`${condition.key}_yes`} className="text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${condition.key}_no`}
                  name={condition.key}
                  checked={value[condition.key] === false}
                  onChange={() => handleConditionChange(condition.key, false)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`${condition.key}_no`} className="text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}