'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { schedulerApi, subscriptionsApi } from '@/lib/api';
import type { SchedulerStatus, AutoResumeResult } from '@/lib/types';

export default function SchedulerPage() {
  return (
    <ProtectedRoute>
      <SchedulerContent />
    </ProtectedRoute>
  );
}

function SchedulerContent() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AutoResumeResult | null>(null);

  useEffect(() => {
    fetchSchedulerStatus();
  }, []);

  const fetchSchedulerStatus = async () => {
    try {
      setLoading(true);
      const response = await schedulerApi.getStatus();
      setStatus(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scheduler status');
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoResume = async () => {
    try {
      setTriggerLoading(true);
      const response = await schedulerApi.triggerAutoResume();
      
      if (response.success) {
        // Try to get the auto-resume results
        try {
          const result = await subscriptionsApi.autoResumeExpired();
          setLastResult(result);
          alert(`Auto-resume completed successfully! ${result.auto_resumed} subscriptions were resumed.`);
        } catch {
          alert('Auto-resume triggered successfully!');
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to trigger auto-resume');
    } finally {
      setTriggerLoading(false);
    }
  };

  if (error) {
    return (
      <Layout title="Scheduler">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading scheduler</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchSchedulerStatus}
                className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Scheduler">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduler Management</h2>
          <p className="text-gray-600">Monitor and control the automatic subscription resume scheduler</p>
        </div>

        {/* Scheduler Status */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </CardContent>
          </Card>
        ) : status ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Scheduler Status</h3>
                <Button variant="outline" size="sm" onClick={fetchSchedulerStatus}>
                  🔄 Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Indicator */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  status.scheduler_running 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    status.scheduler_running ? 'bg-green-500' : 'bg-red-500'
                  } ${status.scheduler_running ? 'animate-pulse' : ''}`} />
                  <span className="font-medium">
                    {status.scheduler_running ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  status.status === 'healthy' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.status}
                </div>
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Interval</div>
                  <div className="text-lg font-semibold text-gray-900">
                    Every {status.auto_resume_interval_hours} hours
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Timezone</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {status.timezone}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Next Check</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ~{status.auto_resume_interval_hours} hours
                  </div>
                </div>
              </div>

              {/* Manual Trigger */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900">Manual Auto-Resume</h4>
                    <p className="text-sm text-gray-600">
                      Manually trigger the auto-resume check for subscriptions with exhausted pause days
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={triggerAutoResume}
                    loading={triggerLoading}
                    disabled={!status.scheduler_running || triggerLoading}
                  >
                    {triggerLoading ? 'Running...' : '▶️ Run Auto-Resume Now'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Last Result */}
        {lastResult && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Last Auto-Resume Result</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{lastResult.auto_resumed}</div>
                  <div className="text-sm text-green-700">Auto-Resumed</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{lastResult.checked}</div>
                  <div className="text-sm text-blue-700">Checked</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{lastResult.errors}</div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Timestamp</div>
                  <div className="text-sm font-medium text-gray-900">{lastResult.timestamp}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">How Auto-Resume Works</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🔄 Automatic Process</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Runs every {status?.auto_resume_interval_hours || 6} hours automatically</li>
                  <li>• Checks all paused subscriptions</li>
                  <li>• Resumes subscriptions when pause days are exhausted</li>
                  <li>• Updates end dates and pause counters</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📋 Resume Criteria</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Subscription is currently paused</li>
                  <li>• Total pause days used ≥ allowed pause days</li>
                  <li>• Valid pause start date exists</li>
                  <li>• Subscription is not expired</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-xl">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-900">Example</h4>
                  <p className="text-sm text-blue-800">
                    A member with a 3-month plan (15 pause days allowed) has used 8 days previously and 
                    has been paused for 10 days. Total = 18 days ≥ 15 allowed, so the subscription 
                    will be automatically resumed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Alert */}
        {status && !status.scheduler_running && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-900">Scheduler Alert</h4>
                  <p className="text-sm text-red-800">
                    The auto-resume scheduler is not running. Subscriptions may not be automatically 
                    resumed when pause days are exhausted. Please check the system status or contact support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}