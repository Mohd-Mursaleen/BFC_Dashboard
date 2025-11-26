'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface QueueStats {
  total_queued: number;
  queued_dates: string[];
  queues: Array<{
    date: string;
    count: number;
  }>;
}

export function QueueStatsWidget() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await whatsappApi.getQueueStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch queue stats:', err);
      setError('Failed to load queue statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icons.clock size={20} />
            Message Queue
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
            <Icons.clock size={20} />
            Message Queue
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

  const totalQueued = stats?.total_queued || 0;
  const hasQueue = totalQueued > 0;

  // Determine color based on queue size
  const getQueueColor = (count: number) => {
    if (count < 100) return 'text-green-600 bg-green-50 border-green-200';
    if (count < 500) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icons.clock size={20} />
            Message Queue
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
      <CardContent className="flex-1">
        <div className="text-center py-4 mb-4 bg-gray-50 rounded-lg border">
          <div className="text-sm text-gray-500 mb-1">Total Pending Messages</div>
          <div className={`text-3xl font-bold ${
            totalQueued === 0 ? 'text-gray-400' : 
            totalQueued < 100 ? 'text-green-600' : 
            totalQueued < 500 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {totalQueued}
          </div>
        </div>

        {hasQueue ? (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Dates</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stats?.queues.map((queue) => (
                <div 
                  key={queue.date}
                  className="flex items-center justify-between p-2 rounded-md bg-white border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icons.calendar size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{queue.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getQueueColor(queue.count)}`}>
                    {queue.count} msgs
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Icons.success className="mx-auto mb-2 text-green-500 opacity-50" size={32} />
            <p className="text-sm">Queue is empty</p>
            <p className="text-xs text-gray-400 mt-1">All messages have been processed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
