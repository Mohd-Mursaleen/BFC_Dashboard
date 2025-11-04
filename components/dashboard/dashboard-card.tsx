'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardCard as DashboardCardType } from '@/lib/types';

interface DashboardCardProps {
  card: DashboardCardType;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';
}

export function DashboardCard({ card, icon, color = 'blue' }: DashboardCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    teal: 'text-teal-600 bg-teal-50',
    red: 'text-red-600 bg-red-50',
  };

  const getChangeColor = (change?: string) => {
    if (!change) return '';
    return change.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card hover className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {icon && (
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                  <span className="text-xl">{icon}</span>
                </div>
              )}
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {card.title}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {card.value}
                </span>
                {card.change && (
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    card.change.startsWith('+') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {card.change}
                  </span>
                )}
              </div>
              
              {card.description && (
                <p className="text-sm text-gray-500">
                  {card.description}
                </p>
              )}
              
              {card.count && (
                <p className="text-sm font-medium text-gray-700">
                  {card.count} members
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}