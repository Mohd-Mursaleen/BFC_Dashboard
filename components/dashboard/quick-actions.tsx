'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddMember: () => void;
  onNewSubscription: () => void;
  onViewReports: () => void;
  onManageScheduler: () => void;
}

export function QuickActions({ 
  onAddMember, 
  onNewSubscription, 
  onViewReports, 
  onManageScheduler 
}: QuickActionsProps) {
  const actions = [
    {
      label: 'Add Member',
      icon: '👤',
      onClick: onAddMember,
      variant: 'primary' as const,
    },
    {
      label: 'New Subscription',
      icon: '📋',
      onClick: onNewSubscription,
      variant: 'success' as const,
    },
    {
      label: 'View Reports',
      icon: '📊',
      onClick: onViewReports,
      variant: 'secondary' as const,
    },
    {
      label: 'Scheduler',
      icon: '⚙️',
      onClick: onManageScheduler,
      variant: 'warning' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}