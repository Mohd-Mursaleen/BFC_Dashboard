'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingCard } from '@/components/ui/loading';
import { plansApi } from '@/lib/api';
import type { Plan } from '@/lib/types';

export default function PlansPage() {
  return (
    <ProtectedRoute>
      <PlansContent />
    </ProtectedRoute>
  );
}

function PlansContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, [showActiveOnly]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = showActiveOnly ? await plansApi.getActive() : await plansApi.getAll();
      setPlans(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getPlanColor = (duration: number) => {
    if (duration <= 1) return 'orange';
    if (duration <= 3) return 'blue';
    if (duration <= 6) return 'purple';
    return 'teal';
  };

  const getPlanIcon = (duration: number) => {
    if (duration <= 1) return '🏃';
    if (duration <= 3) return '💪';
    if (duration <= 6) return '🏆';
    return '👑';
  };

  if (error) {
    return (
      <Layout title="Plans">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading plans</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchPlans}
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
    <Layout title="Plans">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Membership Plans</h2>
            <p className="text-gray-600">Manage gym membership plans and pricing</p>
          </div>
          <Button variant="primary">
            <span>📋</span>
            Add Plan
          </Button>
        </div>

        {/* Filter Toggle */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show active plans only
                </span>
              </label>
              <Button variant="outline" size="sm" onClick={fetchPlans}>
                🔄 Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} hover className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-2xl ${
                        getPlanColor(plan.duration_months) === 'orange' ? 'bg-orange-50' :
                        getPlanColor(plan.duration_months) === 'blue' ? 'bg-blue-50' :
                        getPlanColor(plan.duration_months) === 'purple' ? 'bg-purple-50' :
                        'bg-teal-50'
                      }`}>
                        {getPlanIcon(plan.duration_months)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.plan_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={plan.is_active ? 'active' : 'inactive'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Admission Fee</span>
                      <span className="font-medium">{formatCurrency(plan.admission_fee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Plan Fee</span>
                      <span className="font-medium">{formatCurrency(plan.plan_fee)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total Fee</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(plan.total_fee)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⏸️</span>
                      <span className="text-sm text-gray-600">
                        {plan.pause_days_allowed} pause days allowed
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {plans.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-500 mb-4">
                {showActiveOnly 
                  ? 'No active plans available. Try showing all plans or create a new one.'
                  : 'Get started by creating your first membership plan'
                }
              </p>
              <Button variant="primary">
                <span>📋</span>
                Create Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}