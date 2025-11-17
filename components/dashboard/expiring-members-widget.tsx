'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import type { ExpiringSubscriptionsResponse } from '@/lib/types';

export function ExpiringMembersWidget() {
  const { success, error: showError } = useNotification();
  const [data, setData] = useState<ExpiringSubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    fetchExpiringMembers();
  }, []);

  const fetchExpiringMembers = async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.getExpiringSubscriptions(7);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch expiring members:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    try {
      setSendingReminders(true);
      const response = await whatsappApi.sendExpiryReminders();
      
      if (response.success) {
        success(
          'Reminders Sent',
          `${response.notifications_sent} reminders sent successfully${response.notifications_failed > 0 ? `, ${response.notifications_failed} failed` : ''}`
        );
        fetchExpiringMembers();
      }
    } catch (err) {
      showError('Failed to Send Reminders', err instanceof Error ? err.message : 'Failed to send expiry reminders');
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📱 WhatsApp Reminders</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">📱 WhatsApp Reminders</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchExpiringMembers}
          >
            🔄
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data && (
          <>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{data.count}</div>
                  <div className="text-sm text-orange-700">Expiring in 7 days</div>
                </div>
                <div className="text-4xl">⏰</div>
              </div>
            </div>

            {data.count > 0 ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.subscriptions.slice(0, 5).map((sub) => (
                    <div key={sub.subscription_id} className="border border-gray-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{sub.member_name}</div>
                          <div className="text-xs text-gray-600">📱 {sub.member_phone}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-orange-600">
                            {sub.days_remaining}d
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.count > 5 && (
                    <div className="text-center text-sm text-gray-500">
                      +{data.count - 5} more
                    </div>
                  )}
                </div>
                
                {/* <Button
                  variant="success"
                  className="w-full"
                  onClick={sendReminders}
                  loading={sendingReminders}
                  disabled={sendingReminders}
                >
                  {sendingReminders ? 'Sending...' : '📱 Send Reminders Now'}
                </Button> */}
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-gray-600">No subscriptions expiring soon</p>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              💡 Reminders sent automatically 
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
