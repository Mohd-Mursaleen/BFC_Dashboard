'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { LoadingCard } from '@/components/ui/loading';
import { analyticsApi } from '@/lib/api';
import type { DashboardAnalytics } from '@/lib/types';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboard();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  if (error) {
    return (
      <Layout title="Analytics">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchAnalytics}
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
    <Layout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Detailed insights into your gym's performance and member data</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Filter by Gender"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                options={[
                  { value: 'all', label: 'All Genders' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
              />
              <Select
                label="Filter by Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'expired', label: 'Expired' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Revenue Analytics</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(data.monthly_revenue.current_month)}
                    </div>
                    <div className="text-sm text-purple-700">This Month</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {formatCurrency(data.monthly_revenue.last_month)}
                    </div>
                    <div className="text-sm text-gray-700">Last Month</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className={`text-2xl font-bold ${
                      data.monthly_revenue.growth === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.monthly_revenue.growth === 'increase' ? '+' : '-'}
                      {data.monthly_revenue.percentage_change.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-700">Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Gender Distribution</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.gender_distribution).map(([gender, count]) => {
                      const total = Object.values(data.gender_distribution).reduce((a, b) => a + b, 0);
                      const percentage = getPercentage(count, total);
                      
                      return (
                        <div key={gender} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {gender === 'male' ? '👨' : gender === 'female' ? '👩' : '👤'}
                            </span>
                            <span className="capitalize font-medium">{gender}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Subscription Status</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.subscription_status).map(([status, count]) => {
                      const total = Object.values(data.subscription_status).reduce((a, b) => a + b, 0);
                      const percentage = getPercentage(count, total);
                      const colors = {
                        active: 'bg-green-500',
                        paused: 'bg-orange-500',
                        expired: 'bg-red-500',
                      };
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {status === 'active' ? '✅' : status === 'paused' ? '⏸️' : '❌'}
                            </span>
                            <span className="capitalize font-medium">{status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Plan Popularity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.plan_distribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([plan, count]) => {
                      const total = Object.values(data.plan_distribution).reduce((a, b) => a + b, 0);
                      const percentage = getPercentage(count, total);
                      
                      return (
                        <div key={plan} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {plan === data.most_popular_plan.plan_name ? '🏆' : '📋'}
                            </span>
                            <span className="font-medium">{plan}</span>
                            {plan === data.most_popular_plan.plan_name && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-teal-500 h-3 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-16 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Expiring Soon */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Expiring Soon ({data.expiring_soon.count})</h3>
              </CardHeader>
              <CardContent>
                {data.expiring_soon.subscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {data.expiring_soon.subscriptions.slice(0, 5).map((sub) => (
                      <div key={sub.subscription_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium">Member: {sub.member_id.slice(-8)}</div>
                          <div className="text-sm text-gray-600">Expires: {sub.end_date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">{sub.days_remaining} days</div>
                          <div className="text-sm text-gray-600">remaining</div>
                        </div>
                      </div>
                    ))}
                    {data.expiring_soon.subscriptions.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        And {data.expiring_soon.subscriptions.length - 5} more...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎉</div>
                    <p>No subscriptions expiring in the next 7 days!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </Layout>
  );
}