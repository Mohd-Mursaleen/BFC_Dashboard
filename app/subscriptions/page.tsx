'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { LoadingTable } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { subscriptionsApi } from '@/lib/api';
import { formatDate as formatDateUtil } from '@/lib/utils';
import type { Subscription } from '@/lib/types';
import { Icons } from '@/lib/icons';

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute>
      <SubscriptionsContent />
    </ProtectedRoute>
  );
}

function SubscriptionsContent() {
  const { success, error: showError } = useNotification();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

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

  const handleAddSubscription = () => {
    setShowSubscriptionForm(true);
  };

  const handleFormSuccess = () => {
    fetchSubscriptions();
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    
    // Status filter
    let statusMatch = true;
    switch (filter) {
      case 'active':
        statusMatch = subscription.status === 'active' && !subscription.is_currently_paused && endDate >= today;
        break;
      case 'paused':
        statusMatch = subscription.is_currently_paused;
        break;
      case 'expired':
        statusMatch = endDate < today;
        break;
      default:
        statusMatch = true;
    }
    
    // Search filter
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        subscription.member_name?.toLowerCase().includes(query) ||
        subscription.member_phone?.toLowerCase().includes(query) ||
        subscription.receipt_number?.toLowerCase().includes(query) ||
        subscription.plan_name?.toLowerCase().includes(query) ||
        subscription.member_id?.toLowerCase().includes(query);
    }
    
    return statusMatch && searchMatch;
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const calculateProgress = (subscription: Subscription) => {
    const used = subscription.pause_days_used;
    const total = subscription.total_pause_days_allowed;
    const progress = total > 0 ? (used / total) * 100 : 0;
    
    // Debug logging to check if data is correct
    console.log('Progress calculation (list):', {
      used,
      total,
      progress,
      subscription_id: subscription.id
    });
    
    return progress;
  };

  if (error) {
    return (
      <Layout title="Subscriptions">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <Icons.warning className="text-red-400 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading subscriptions</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 flex items-center gap-2"
              >
                <Icons.refresh size={16} />
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
          <Button variant="primary" onClick={handleAddSubscription}>
            <Icons.subscriptions size={18} />
            New Subscription
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by member name, phone, receipt number, or plan..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Icons.search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
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
                  <Icons.refresh size={16} />
                  Refresh
                </Button>
              </div>
            </div>
            
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mt-3 text-sm text-gray-600">
                Found {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
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
                        Subscription
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription) => (
                      <tr 
                        key={subscription.id} 
                        onClick={() => window.location.href = `/subscriptions/${subscription.id}`}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.member_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Receipt: {subscription.receipt_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subscription.plan_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.payment_mode.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDateUtil(subscription.start_date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {formatDateUtil(subscription.actual_end_date || subscription.end_date)}
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
                                style={{ 
                                  width: `${Math.max(calculateProgress(subscription), subscription.pause_days_used > 0 ? 5 : 0)}%`,
                                  minWidth: subscription.pause_days_used > 0 ? '6px' : '0px'
                                }}
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
                              Since {formatDateUtil(subscription.current_pause_start_date)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredSubscriptions.length === 0 && (
                  <div className="text-center py-12">
                    {searchQuery ? (
                      <Icons.search className="mx-auto mb-4 text-gray-400" size={64} />
                    ) : (
                      <Icons.subscriptions className="mx-auto mb-4 text-gray-400" size={64} />
                    )}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                    <p className="text-gray-500">
                      {searchQuery
                        ? `No subscriptions match "${searchQuery}". Try a different search term.`
                        : filter !== 'all'
                        ? `No ${filter} subscriptions found. Try changing the filter.`
                        : 'Get started by creating your first subscription'
                      }
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Form Modal */}
        <SubscriptionForm
          isOpen={showSubscriptionForm}
          onClose={() => setShowSubscriptionForm(false)}
          onSuccess={handleFormSuccess}
          subscription={null}
        />
      </div>
    </Layout>
  );
}