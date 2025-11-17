'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';

interface QuickActionsProps {
  onAddMember: () => void;
  onNewSubscription: () => void;
  onManageScheduler: () => void;
  onWhatsAppBroadcast: () => void;
}

export function QuickActions({ 
  onAddMember, 
  onNewSubscription, 
  onManageScheduler,
  onWhatsAppBroadcast
}: QuickActionsProps) {
  const actions = [
    {
      label: 'Add Member',
      Icon: Icons.addMember,
      onClick: onAddMember,
      variant: 'outline' as const,
    },
    {
      label: 'New Subscription',
      Icon: Icons.subscriptions,
      onClick: onNewSubscription,
      variant: 'success' as const,
    },
    {
      label: 'WhatsApp Broadcast',
      Icon: Icons.whatsapp,
      onClick: onWhatsAppBroadcast,
      variant: 'secondary' as const,
    },
    {
      label: 'Scheduler',
      Icon: Icons.scheduler,
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
          {actions.map((action, index) => {
            const IconComponent = action.Icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <IconComponent size={24} />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}