'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface MemberGrowthChartProps {
  data: Array<{
    month: string;
    new_members: number;
    total_members: number;
    month_name: string;
    year: number;
  }>;
}

export function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  const chartData = data.map(item => ({
    ...item,
    displayName: item.month_name.substring(0, 3),
  }));

  const totalNewMembers = data.reduce((sum, item) => sum + item.new_members, 0);
  const currentTotal = data[data.length - 1]?.total_members || 0;
  const previousTotal = data[0]?.total_members || 0;
  const growthRate = previousTotal > 0 
    ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">👥 Member Growth</h3>
        <p className="text-sm text-gray-600">New members and total growth trend</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{ value: 'Total Members', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: 'New Members', angle: 90, position: 'insideRight', fontSize: 12 }}
            />
            <Tooltip 
              labelFormatter={(label) => {
                const item = chartData.find(d => d.displayName === label);
                return item ? `${item.month_name} ${item.year}` : label;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="total_members" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Total Members"
              dot={{ r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="new_members" 
              stroke="#10b981" 
              strokeWidth={2}
              name="New Members"
              dot={{ r: 3 }}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{currentTotal}</div>
            <div className="text-xs text-blue-700">Current Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{totalNewMembers}</div>
            <div className="text-xs text-green-700">New (6 months)</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">+{growthRate}%</div>
            <div className="text-xs text-purple-700">Growth Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
