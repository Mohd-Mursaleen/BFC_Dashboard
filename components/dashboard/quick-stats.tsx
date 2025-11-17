'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

interface QuickStatsProps {
  stats: {
    total_plans: number;
    male_members: number;
    female_members: number;
    paused_subscriptions: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statItems = [
    { label: 'Total Plans', value: stats.total_plans, Icon: Icons.plans },
    { label: 'Male Members', value: stats.male_members, Icon: Icons.male },
    { label: 'Female Members', value: stats.female_members, Icon: Icons.female },
    { label: 'Paused Subscriptions', value: stats.paused_subscriptions, Icon: Icons.paused },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => {
            const IconComponent = item.Icon;
            return (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <IconComponent className="mx-auto mb-2 text-blue-600" size={28} />
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}