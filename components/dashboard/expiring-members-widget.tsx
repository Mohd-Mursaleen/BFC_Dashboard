'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { subscriptionsApi, whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface ExpiringSubscription {
  subscription_id: string;
  member_name: string;
  member_phone: string;
  end_date: string;
  days_remaining: number;
  plan_name: string;
}

interface ExpiringSubscriptionsResponse {
  count: number;
  subscriptions: ExpiringSubscription[];
}

interface SubscriptionFromAPI {
  id: string;
  member_name: string;
  member_phone: string;
  plan_name: string;
  end_date: string;
  status: string;
}

export function ExpiringMembersWidget() {
  const { success, error, warning } = useNotification();
  const [data, setData] = useState<ExpiringSubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingReminders, setSendingReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchExpiringMembers();
  }, []);

  const fetchExpiringMembers = async () => {
    try {
      setLoading(true);
      // Get all subscriptions and filter for expiring ones
      const response = await subscriptionsApi.getAll();
      const subscriptions: SubscriptionFromAPI[] = response.data || [];
      
      // Calculate expiring subscriptions (next 7 days)
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const expiringSubscriptions = subscriptions
        .filter((sub: SubscriptionFromAPI) => {
          if (sub.status !== 'active') return false;
          const endDate = new Date(sub.end_date);
          return endDate >= today && endDate <= sevenDaysFromNow;
        })
        .map((sub: SubscriptionFromAPI) => {
          const endDate = new Date(sub.end_date);
          const timeDiff = endDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          return {
            subscription_id: sub.id,
            member_name: sub.member_name || 'Unknown',
            member_phone: sub.member_phone || 'N/A',
            end_date: sub.end_date,
            days_remaining: Math.max(0, daysRemaining),
            plan_name: sub.plan_name || 'Unknown Plan'
          };
        })
        .sort((a, b) => a.days_remaining - b.days_remaining);

      setData({
        count: expiringSubscriptions.length,
        subscriptions: expiringSubscriptions
      });
    } catch (err) {
      console.error('Failed to fetch expiring members:', err);
      error('Failed to Load', 'Could not fetch expiring subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const sendExpiryReminder = async (subscription: ExpiringSubscription) => {
    setSendingReminders(prev => new Set(prev).add(subscription.subscription_id));
    
    try {
      await whatsappApi.sendExpiry({
        member_phone: subscription.member_phone,
        member_name: subscription.member_name,
        days_remaining: subscription.days_remaining,
        end_date: subscription.end_date
      });
      
      success('Reminder Sent!', `Expiry reminder sent to ${subscription.member_name}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send reminder';
      error('Reminder Failed', errorMsg);
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscription.subscription_id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">⏰ Expiring Subscriptions</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredSubscriptions = data?.subscriptions.filter(sub => 
    sub.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.member_phone.includes(searchTerm) ||
    sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const displayedSubscriptions = showAll 
    ? filteredSubscriptions 
    : filteredSubscriptions.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icons.clock className="text-orange-600" size={28} />
            <div>
              <h3 className="text-lg font-semibold">Expiring Subscriptions</h3>
              <p className="text-sm text-gray-600">Members with subscriptions expiring in the next 7 days</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchExpiringMembers}
            disabled={loading}
          >
            <Icons.refresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-600">{data.count}</div>
                    <div className="text-sm text-orange-700">Expiring in 7 days</div>
                  </div>
                  <Icons.clock className="text-orange-400" size={48} />
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-600">
                      {filteredSubscriptions.filter(s => s.days_remaining <= 3).length}
                    </div>
                    <div className="text-sm text-red-700">Critical (≤3 days)</div>
                  </div>
                  <Icons.bell className="text-red-400" size={48} />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">
                      {filteredSubscriptions.filter(s => s.days_remaining > 3).length}
                    </div>
                    <div className="text-sm text-yellow-700">Warning (4-7 days)</div>
                  </div>
                  <Icons.warning className="text-yellow-400" size={48} />
                </div>
              </div>
            </div>

            {data.count > 0 ? (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, phone, or plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Members List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {displayedSubscriptions.map((sub) => {
                    const isUrgent = sub.days_remaining <= 3;
                    const isSending = sendingReminders.has(sub.subscription_id);
                    return (
                      <div 
                        key={sub.subscription_id} 
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                          isUrgent 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-yellow-300 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900">{sub.member_name}</div>
                              {isUrgent && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded-full">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Icons.phone size={14} />
                                {sub.member_phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icons.plans size={14} />
                                {sub.plan_name}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Icons.calendar size={12} />
                              Expires: {new Date(sub.end_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                isUrgent ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {sub.days_remaining}
                              </div>
                              <div className="text-xs text-gray-600">
                                {sub.days_remaining === 0 ? 'expires today' : 
                                 sub.days_remaining === 1 ? 'day left' : 'days left'}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendExpiryReminder(sub)}
                              disabled={isSending}
                              className="flex items-center gap-1 text-xs"
                            >
                              {isSending ? (
                                <>
                                  <Icons.refresh className="animate-spin" size={12} />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Icons.whatsapp size={12} />
                                  Send Reminder
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show More/Less Button */}
                {filteredSubscriptions.length > 10 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAll(!showAll)}
                      className="w-full md:w-auto"
                    >
                      {showAll 
                        ? `Show Less` 
                        : `Show All (${filteredSubscriptions.length - 10} more)`
                      }
                    </Button>
                  </div>
                )}

                {filteredSubscriptions.length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-gray-600">No members found matching "{searchTerm}"</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Icons.success className="mx-auto mb-4 text-green-500" size={64} />
                <p className="text-lg font-medium text-gray-900">All Clear!</p>
                <p className="text-sm text-gray-600 mt-2">No subscriptions expiring in the next 7 days</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
