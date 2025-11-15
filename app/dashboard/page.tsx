'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ExpiringMembersWidget } from '@/components/dashboard/expiring-members-widget';
import { LoadingCard } from '@/components/ui/loading';
import { analyticsApi } from '@/lib/api';
import type { DashboardSummary } from '@/lib/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getSummary();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    window.location.href = '/members';
  };

  const handleNewSubscription = () => {
    window.location.href = '/subscriptions';
  };

  const handleViewReports = () => {
    window.location.href = '/analytics';
  };

  const handleManageScheduler = () => {
    window.location.href = '/scheduler';
  };

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchDashboardData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <LoadingCard key={i} />
            ))
          ) : data ? (
            <>
              <DashboardCard
                card={data.cards.total_members}
                icon="👥"
                color="blue"
              />
              <DashboardCard
                card={data.cards.active_members}
                icon="✅"
                color="green"
              />
              <DashboardCard
                card={data.cards.monthly_revenue}
                icon="💰"
                color="purple"
              />
              <DashboardCard
                card={data.cards.expiring_soon}
                icon="⚠️"
                color="orange"
              />
              <DashboardCard
                card={data.cards.popular_plan}
                icon="🏆"
                color="teal"
              />
            </>
          ) : null}
        </div>

        {/* Quick Stats, Actions, and WhatsApp Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : data ? (
            <>
              <QuickStats stats={data.quick_stats} />
              <QuickActions
                onAddMember={handleAddMember}
                onNewSubscription={handleNewSubscription}
                onViewReports={handleViewReports}
                onManageScheduler={handleManageScheduler}
              />
              <ExpiringMembersWidget />
            </>
          ) : null}
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center text-sm text-gray-500">
          <p>Dashboard auto-refreshes every 5 minutes</p>
          <button
            onClick={fetchDashboardData}
            className="text-blue-600 hover:text-blue-800 underline ml-2"
          >
            Refresh now
          </button>
        </div>
      </div>
    </Layout>
  );
}