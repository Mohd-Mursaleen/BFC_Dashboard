'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface LimitStats {
  date: string;
  messages_sent: number;
  daily_limit: number;
  remaining: number;
  percentage_used: number;
}

export function LimitStatsWidget() {
  const [stats, setStats] = useState<LimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await whatsappApi.getLimitStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch limit stats:', err);
      setError('Failed to load limit statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icons.chart size={20} />
            Daily Limit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icons.chart size={20} />
            Daily Limit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-600">
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = stats?.percentage_used || 0;
  
  // Determine color based on usage percentage
  const getProgressColor = (pct: number) => {
    if (pct < 70) return 'bg-green-500';
    if (pct < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icons.chart size={20} />
            Daily Limit
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            disabled={loading}
            // className="h-8 w-8 p-0 border-0"
          >
            <Icons.refresh className={loading ? 'animate-spin' : ''} size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.messages_sent.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {stats?.daily_limit.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Messages sent today</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-gray-700">
                {stats?.remaining.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold inline-block text-gray-600">
                {percentage.toFixed(1)}% Used
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
              <div 
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getProgressColor(percentage)}`}
              ></div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            Resets daily at midnight
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
