'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ExpiringMembersWidget } from '@/components/dashboard/expiring-members-widget';
import { PlanDistributionChart } from '@/components/dashboard/charts/plan-distribution-chart';
import { SubscriptionStatusChart } from '@/components/dashboard/charts/subscription-status-chart';
import { RevenueHistoryChart } from '@/components/dashboard/charts/revenue-history-chart';
import { MemberGrowthChart } from '@/components/dashboard/charts/member-growth-chart';
import { LoadingCard } from '@/components/ui/loading';
import { analyticsApi } from '@/lib/api';
import type { DashboardSummary, DashboardAnalytics } from '@/lib/types';
import { Icons } from '@/lib/icons';

export default function DashboardPage() {
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summary, analytics] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getDashboard()
      ]);
      setSummaryData(summary);
      setAnalyticsData(analytics);
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

  const handleManageScheduler = () => {
    window.location.href = '/scheduler';
  };

  const handleWhatsAppBroadcast = () => {
    window.location.href = '/whatsapp-broadcast';
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
          ) : summaryData ? (
            <>
              <DashboardCard
                card={summaryData.cards.total_members}
                Icon={Icons.members}
                color="blue"
              />
              <DashboardCard
                card={summaryData.cards.active_members}
                Icon={Icons.active}
                color="green"
              />
              <DashboardCard
                card={summaryData.cards.monthly_revenue}
                Icon={Icons.revenue}
                color="purple"
              />
              <DashboardCard
                card={summaryData.cards.expiring_soon}
                Icon={Icons.warning}
                color="orange"
              />
              <DashboardCard
                card={summaryData.cards.popular_plan}
                Icon={Icons.trophy}
                color="teal"
              />
            </>
          ) : null}
        </div>

        {/* Charts Section */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlanDistributionChart data={analyticsData.plan_distribution} />
            <SubscriptionStatusChart data={analyticsData.subscription_status} />
            {analyticsData.revenue_history && analyticsData.revenue_history.length > 0 && (
              <RevenueHistoryChart data={analyticsData.revenue_history} />
            )}
            {analyticsData.member_growth && analyticsData.member_growth.length > 0 && (
              <MemberGrowthChart data={analyticsData.member_growth} />
            )}
          </div>
        ) : null}

        {/* Quick Stats and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
            </>
          ) : summaryData ? (
            <>
              <QuickStats stats={summaryData.quick_stats} />
              <QuickActions
                onAddMember={handleAddMember}
                onNewSubscription={handleNewSubscription}
                onManageScheduler={handleManageScheduler}
                onWhatsAppBroadcast={handleWhatsAppBroadcast}
              />
            </>
          ) : null}
        </div>

        {/* WhatsApp Widget - Full Width */}
        <div>
          {loading ? (
            <LoadingCard />
          ) : (
            <ExpiringMembersWidget />
          )}
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