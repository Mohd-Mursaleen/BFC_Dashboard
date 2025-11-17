'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SubscriptionStatusChartProps {
  data: {
    active: number;
    paused: number;
    expired: number;
  };
}

const COLORS = {
  active: '#10b981',
  paused: '#f59e0b',
  expired: '#ef4444',
};

const STATUS_ICONS = {
  active: '✅',
  paused: '⏸️',
  expired: '❌',
  total: '📊',
};

export function SubscriptionStatusChart({ data }: SubscriptionStatusChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: COLORS[name as keyof typeof COLORS],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">📈 Subscription Status</h3>
        <p className="text-sm text-gray-600">Current subscription breakdown</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} subscriptions`, 'Count']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {Object.entries(data).map(([status, count]) => (
            <div key={status} className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl">{STATUS_ICONS[status as keyof typeof STATUS_ICONS]}</div>
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-600 capitalize">{status}</div>
            </div>
          ))}
          <div className="text-center p-2 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-xl">{STATUS_ICONS.total}</div>
            <div className="text-lg font-bold text-blue-900">{total}</div>
            <div className="text-xs text-blue-700 capitalize">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
