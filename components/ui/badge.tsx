import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'paused' | 'expired' | 'inactive' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const variants = {
    active: 'bg-green-100 text-green-800 border-green-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-orange-100 text-orange-800 border-orange-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}