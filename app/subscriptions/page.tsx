'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { LoadingTable } from '@/components/ui/loading';
import { subscriptionsApi } from '@/lib/api';
import type { Subscription } from '@/lib/types';

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute>
      <SubscriptionsContent />
    </ProtectedRoute>
  );
}

function SubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getAll();
      setSubscriptions(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (subscriptionId: string) => {
    const reason = prompt('Reason for pause (optional):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(subscriptionId);
      await subscriptionsApi.pause(subscriptionId, reason);
      await fetchSubscriptions(); // Refresh data
      alert('Subscription paused successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to pause subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to resume this subscription?')) return;

    try {
      setActionLoading(subscriptionId);
      const result = await subscriptionsApi.resume(subscriptionId);
      await fetchSubscriptions(); // Refresh data
      alert(`Subscription resumed successfully. Days paused: ${result.days_paused}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    
    switch (filter) {
      case 'active':
        return subscription.status === 'active' && !subscription.is_currently_paused && endDate >= today;
      case 'paused':
        return subscription.is_currently_paused;
      case 'expired':
        return endDate < today;
      default:
        return true;
    }
  });

  const getStatusBadgeVariant = (subscription: Subscription) => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    
    if (endDate < today) return 'danger';
    if (subscription.is_currently_paused) return 'warning';
    return 'active';
  };

  const getStatusText = (subscription: Subscription) => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    
    if (endDate < today) return 'Expired';
    if (subscription.is_currently_paused) return 'Paused';
    return 'Active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const calculateProgress = (subscription: Subscription) => {
    const used = subscription.pause_days_used;
    const total = subscription.total_pause_days_allowed;
    return total > 0 ? (used / total) * 100 : 0;
  };

  if (error) {
    return (
      <Layout title="Subscriptions">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading subscriptions</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchSubscriptions}
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
    <Layout title="Subscriptions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
            <p className="text-gray-600">Manage member subscriptions and pause/resume functionality</p>
          </div>
          <Button variant="primary">
            <span>📝</span>
            New Subscription
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Subscriptions' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'paused', label: 'Paused Only' },
                  { value: 'expired', label: 'Expired Only' },
                ]}
              />
              <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
                🔄 Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        {loading ? (
          <LoadingTable rows={8} columns={7} />
        ) : (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Subscriptions ({filteredSubscriptions.length})
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pause Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Member ID: {subscription.member_id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Receipt: {subscription.receipt_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Plan ID: {subscription.plan_id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.payment_mode.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(subscription.start_date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {formatDate(subscription.actual_end_date || subscription.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {subscription.pause_days_used} / {subscription.total_pause_days_allowed} used
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${calculateProgress(subscription)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">
                              {subscription.pause_days_remaining} remaining
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(subscription.amount_paid)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(subscription)}>
                            {getStatusText(subscription)}
                          </Badge>
                          {subscription.is_currently_paused && subscription.current_pause_start_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Since {formatDate(subscription.current_pause_start_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {subscription.is_currently_paused ? (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleResume(subscription.id)}
                                loading={actionLoading === subscription.id}
                                disabled={actionLoading === subscription.id}
                              >
                                ▶️ Resume
                              </Button>
                            ) : (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handlePause(subscription.id)}
                                loading={actionLoading === subscription.id}
                                disabled={
                                  actionLoading === subscription.id || 
                                  subscription.pause_days_remaining === 0 ||
                                  getStatusText(subscription) === 'Expired'
                                }
                              >
                                ⏸️ Pause
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredSubscriptions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                    <p className="text-gray-500">
                      {filter !== 'all'
                        ? `No ${filter} subscriptions found. Try changing the filter.`
                        : 'Get started by creating your first subscription'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}