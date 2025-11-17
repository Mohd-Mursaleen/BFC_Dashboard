'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

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
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Subscription Status</h3>
        </div>
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
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <Icons.active className="mx-auto mb-1 text-green-600" size={20} />
            <div className="text-lg font-bold text-gray-900">{data.active}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <Icons.paused className="mx-auto mb-1 text-orange-600" size={20} />
            <div className="text-lg font-bold text-gray-900">{data.paused}</div>
            <div className="text-xs text-gray-600">Paused</div>
          </div>
          {/* <div className="text-center p-2 bg-red-50 rounded-lg">
            <Icons.expired className="mx-auto mb-1 text-red-600" size={20} />
            <div className="text-lg font-bold text-gray-900">{data.expired}</div>
            <div className="text-xs text-gray-600">Expired</div>
          </div> */}
          <div className="text-center p-2 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Icons.chartBar className="mx-auto mb-1 text-blue-600" size={20} />
            <div className="text-lg font-bold text-blue-900">{total}</div>
            <div className="text-xs text-blue-700">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
