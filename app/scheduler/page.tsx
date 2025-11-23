'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { schedulerApi, subscriptionsApi, whatsappApi } from '@/lib/api';
import type { SchedulerStatus, AutoResumeResult, WhatsAppTestResponse, ExpiringSubscriptionsResponse, ExpiryRemindersResponse } from '@/lib/types';
import { Icons } from '@/lib/icons';

export default function SchedulerPage() {
  return (
    <ProtectedRoute>
      <SchedulerContent />
    </ProtectedRoute>
  );
}

function SchedulerContent() {
  const { success, error: showError } = useNotification();
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AutoResumeResult | null>(null);
  
  // WhatsApp states
  const [testPhone, setTestPhone] = useState('918218134535');
  const [testResult, setTestResult] = useState<WhatsAppTestResponse | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [expiringData, setExpiringData] = useState<ExpiringSubscriptionsResponse | null>(null);
  const [expiringLoading, setExpiringLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderResult, setReminderResult] = useState<ExpiryRemindersResponse | null>(null);

  useEffect(() => {
    fetchSchedulerStatus();
    // fetchExpiringSubscriptions();
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
          success(
            'Auto-Resume Completed', 
            `${result.auto_resumed} subscriptions were resumed, ${result.checked} checked, ${result.errors} errors`
          );
        } catch {
          success('Auto-Resume Triggered', 'Auto-resume process has been triggered successfully');
        }
      }
    } catch (err) {
      showError('Auto-Resume Failed', err instanceof Error ? err.message : 'Failed to trigger auto-resume');
    } finally {
      setTriggerLoading(false);
    }
  };

  // WhatsApp functions
  // const testWhatsAppConnection = async () => {
  //   try {
  //     setTestLoading(true);
  //     const response = await whatsappApi.test(testPhone);
  //     setTestResult(response);
      
  //     if (response.connection_status === 'success') {
  //       success('WhatsApp Test Successful', 'Test message sent successfully!');
  //     } else {
  //       showError('WhatsApp Test Failed', response.details.error || 'Failed to send test message');
  //     }
  //   } catch (err) {
  //     showError('WhatsApp Test Failed', err instanceof Error ? err.message : 'Failed to test WhatsApp connection');
  //     setTestResult({
  //       test_phone: testPhone,
  //       connection_status: 'failed',
  //       details: {
  //         success: false,
  //         error: err instanceof Error ? err.message : 'Unknown error'
  //       }
  //     });
  //   } finally {
  //     setTestLoading(false);
  //   }
  // };

  // const fetchExpiringSubscriptions = async () => {
  //   try {
  //     setExpiringLoading(true);
  //     const response = await whatsappApi.getExpiringSubscriptions(7);
  //     setExpiringData(response);
  //   } catch (err) {
  //     console.error('Failed to fetch expiring subscriptions:', err);
  //   } finally {
  //     setExpiringLoading(false);
  //   }
  // };

  // const sendExpiryReminders = async () => {
  //   try {
  //     setReminderLoading(true);
  //     const response = await whatsappApi.sendExpiryReminders();
  //     setReminderResult(response);
      
  //     if (response.success) {
  //       success(
  //         'Reminders Sent',
  //         `${response.notifications_sent} reminders sent successfully${response.notifications_failed > 0 ? `, ${response.notifications_failed} failed` : ''}`
  //       );
  //       fetchExpiringSubscriptions(); // Refresh the list
  //     }
  //   } catch (err) {
  //     showError('Failed to Send Reminders', err instanceof Error ? err.message : 'Failed to send expiry reminders');
  //   } finally {
  //     setReminderLoading(false);
  //   }
  // };

  // const triggerExpiryReminders = async () => {
  //   try {
  //     setReminderLoading(true);
  //     const response = await schedulerApi.triggerExpiryReminders();
      
  //     if (response.success) {
  //       success('Reminder Job Triggered', 'Expiry reminder check executed successfully');
  //       fetchExpiringSubscriptions(); // Refresh the list
  //     }
  //   } catch (err) {
  //     showError('Failed to Trigger Reminders', err instanceof Error ? err.message : 'Failed to trigger expiry reminders');
  //   } finally {
  //     setReminderLoading(false);
  //   }
  // };

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
                  <Icons.refresh size={16} />
                  Refresh
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
                    {triggerLoading ? (
                      <>
                        <Icons.refresh className="animate-spin" size={16} />
                        Running...
                      </>
                    ) : (
                      <>
                        <Icons.play size={16} />
                        Run Auto-Resume Now
                      </>
                    )}
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

        {/* WhatsApp Integration Section */}
        {/* <div className="border-t-4 border-green-500 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 WhatsApp Integration</h2>
          <p className="text-gray-600 mb-6">Test WhatsApp connection and manage expiry reminders</p> */}

          {/* WhatsApp Test */}
          {/* <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Test WhatsApp Connection</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Phone Number
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="918218134535"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 915 (country code + number)</p>
                </div>
                <div className="flex items-center mt-2 ">
                  <Button
                    variant="primary"
                    // onClick={testWhatsAppConnection}
                    loading={testLoading}
                    disabled={testLoading || !testPhone}
                  >
                    {testLoading ? 'Testing...' : '📱 Test Connection'}
                  </Button>
                </div>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.connection_status === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {testResult.connection_status === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        testResult.connection_status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testResult.connection_status === 'success' ? 'Success!' : 'Failed'}
                      </h4>
                      {testResult.connection_status === 'success' ? (
                        <div className="text-sm text-green-800 mt-1">
                          <p>Test message sent successfully to {testResult.test_phone}</p>
                          {testResult.details.message_id && (
                            <p className="text-xs mt-1 font-mono">Message ID: {testResult.details.message_id}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-800 mt-1">
                          <p>Failed to send test message</p>
                          <p className="text-xs mt-1">{testResult.details.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Expiring Subscriptions */}
          {/* <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">⏰ Expiring Subscriptions (Next 7 Days)</h3>
                <div className="flex gap-2">
                  {/* <Button variant="outline" size="sm" onClick={fetchExpiringSubscriptions}> */}
                    {/* <Icons.refresh size={16} />
                    Refresh
                  </Button> */}
                  {/* <Button 
                    variant="success" 
                    size="sm" 
                    onClick={sendExpiryReminders}
                    loading={reminderLoading}
                    disabled={reminderLoading || !expiringData || expiringData.count === 0}
                  >
                    📱 Send Reminders Now
                  </Button> */}
                {/* </div>
              </div>
            </CardHeader>
            <CardContent>
              {expiringLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : expiringData ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{expiringData.count}</div>
                        <div className="text-sm text-orange-700">Subscriptions expiring soon</div>
                      </div>
                      <div className="text-4xl">⏰</div>
                    </div>
                  </div>

                  {expiringData.count > 0 ? (
                    <div className="space-y-2">
                      {expiringData.subscriptions.map((sub) => (
                        <div key={sub.subscription_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{sub.member_name}</div>
                              <div className="text-sm text-gray-600">📱 {sub.member_phone}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-orange-600">
                                {sub.days_remaining} days remaining
                              </div>
                              <div className="text-xs text-gray-500">Expires: {sub.end_date}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-gray-600">No subscriptions expiring in the next 7 days</p>
                    </div>
                  )}
                </div>
              ) : null}

              {reminderResult && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Last Reminder Run</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600">Checked Date</div>
                      <div className="font-medium">{reminderResult.checked_date}</div>
                    </div>
                    <div>
                      <div className="text-blue-600">Expiring</div>
                      <div className="font-medium">{reminderResult.expiring_in_7_days}</div>
                    </div>
                    <div>
                      <div className="text-green-600">Sent</div>
                      <div className="font-medium">{reminderResult.notifications_sent}</div>
                    </div>
                    <div>
                      <div className="text-red-600">Failed</div>
                      <div className="font-medium">{reminderResult.notifications_failed}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent> */}
          {/* </Card> */} 

          {/* WhatsApp Info */}
          {/* <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">📱 WhatsApp Notifications</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🔔 Automatic Notifications</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Welcome Message:</strong> Sent when new member is created</li>
                    <li>• <strong>Subscription Confirmation:</strong> Sent when subscription is created</li>
                    <li>• <strong>Expiry Reminder:</strong> Sent daily at 10:00 AM IST for subscriptions expiring in 7 days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📋 Manual Actions</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Test WhatsApp connection with any phone number</li>
                    <li>• View upcoming expiring subscriptions</li>
                    <li>• Manually trigger expiry reminders</li>
                    <li>• Send welcome messages from member profiles</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl">💡</span>
                  <div>
                    <h4 className="font-semibold text-blue-900">Phone Number Format</h4>
                    <p className="text-sm text-blue-800">
                      Use format: <code className="bg-blue-100 px-2 py-1 rounded">918218134535</code> (country code + number without spaces or special characters)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      {/* </div> */}
    </Layout>
  );
}