'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RevenueHistoryChartProps {
  data: Array<{
    month: string;
    revenue: number;
    month_name: string;
    year: number;
  }>;
}

export function RevenueHistoryChart({ data }: RevenueHistoryChartProps) {
  const formatCurrency = (value: number) => {
    return `₹${(value / 1000).toFixed(0)}k`;
  };

  const chartData = data.map(item => ({
    ...item,
    displayName: item.month_name.substring(0, 3),
  }));

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / data.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Revenue History</h3>
        </div>
        <p className="text-sm text-gray-600">Last 6 months revenue trend</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.displayName === label);
                return item ? `${item.month_name} ${item.year}` : label;
              }}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#8b5cf6" 
              name="Revenue"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-purple-700">Total (6 months)</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">
              ₹{Math.round(avgRevenue).toLocaleString()}
            </div>
            <div className="text-xs text-blue-700">Average/Month</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
