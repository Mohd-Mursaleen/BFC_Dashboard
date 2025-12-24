'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { ConfirmModal } from '@/components/ui/modal';
import { useNotification } from '@/components/ui/notification';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { PauseReasonModal } from '@/components/forms/pause-reason-modal';
import { subscriptionsApi } from '@/lib/api';
import { formatDate as formatDateUtil } from '@/lib/utils';
import type { Subscription } from '@/lib/types';

export default function SubscriptionDetailPage() {
  return (
    <ProtectedRoute>
      <SubscriptionDetailContent />
    </ProtectedRoute>
  );
}

function SubscriptionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const subscriptionId = params.id as string;

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      // Backend returns subscription with nested member and plan objects
      const subscriptionResponse = await subscriptionsApi.getById(subscriptionId);
      setSubscription(subscriptionResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!subscription) return;

    setDeleteLoading(true);
    try {
      await subscriptionsApi.delete(subscription.id);
      success('Subscription Deleted', 'Subscription has been deleted successfully');
      router.push('/subscriptions');
    } catch (err) {
      showError('Delete Failed', err instanceof Error ? err.message : 'Failed to delete subscription');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePauseClick = () => {
    setShowPauseModal(true);
  };

  const handlePause = async (reason: string) => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      await subscriptionsApi.pause(subscription.id, reason);
      await fetchSubscriptionDetails();
      success('Subscription Paused', `Subscription has been paused successfully. Reason: ${reason}`);
      setShowPauseModal(false);
    } catch (err) {
      showError('Pause Failed', err instanceof Error ? err.message : 'Failed to pause subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeClick = () => {
    setShowResumeConfirm(true);
  };

  const handleResume = async () => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      const result = await subscriptionsApi.resume(subscription.id);
      await fetchSubscriptionDetails();
      success('Subscription Resumed', `Subscription resumed successfully. Days paused: ${result.days_paused}`);
      setShowResumeConfirm(false);
    } catch (err) {
      showError('Resume Failed', err instanceof Error ? err.message : 'Failed to resume subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchSubscriptionDetails();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

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

  const calculateProgress = (subscription: Subscription) => {
    const used = subscription.pause_days_used;
    const total = subscription.total_pause_days_allowed;
    const progress = total > 0 ? (used / total) * 100 : 0;
    
    // Debug logging to check if data is correct
    console.log('Progress calculation:', {
      used,
      total,
      progress,
      subscription_id: subscription.id
    });
    
    return progress;
  };

  if (loading) {
    return (
      <Layout title="Subscription Details">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !subscription) {
    return (
      <Layout title="Subscription Details">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading subscription</h3>
              <p className="mt-2 text-sm text-red-700">{error || 'Subscription not found'}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={fetchSubscriptionDetails}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/subscriptions')}
                  className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  Back to Subscriptions
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isExpired = () => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    return endDate < today;
  };

  return (
    <Layout title="Subscription Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Subscription Details</h2>
              <p className="text-gray-600">Receipt: {subscription.receipt_number}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleEdit}>
              <span>✏️</span>
              Edit Subscription
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <span>⚠️</span>
              Delete Subscription
            </Button>
          </div>
        </div>

        {/* Status and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge variant={getStatusBadgeVariant(subscription)} className="text-lg px-4 py-2">
                  {getStatusText(subscription)}
                </Badge>
                {subscription.is_currently_paused && subscription.current_pause_start_date && (
                  <span className="text-sm text-gray-600">
                    Paused since {formatDateUtil(subscription.current_pause_start_date)}
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                {subscription.is_currently_paused ? (
                  <Button
                    variant="success"
                    onClick={handleResumeClick}
                    loading={actionLoading}
                    disabled={actionLoading}
                  >
                    ▶️ Resume Subscription
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handlePauseClick}
                    loading={actionLoading}
                    disabled={
                      actionLoading || 
                      subscription.pause_days_remaining === 0 ||
                      isExpired()
                    }
                  >
                    ⏸️ Pause Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Information */}
          {subscription.member && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Member Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Name</label>
                    <button
                      onClick={() => subscription.member?.id && router.push(`/members/${subscription.member.id}`)}
                      className="block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {subscription.member?.full_name}
                    </button>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{subscription.member?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{subscription.member?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={subscription.member?.status === 'active' ? 'active' : 'inactive'}>
                      {subscription.member?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Information */}
          {subscription.plan && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Plan Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan Name</label>
                    <p className="text-sm font-medium text-gray-900">{subscription.plan?.plan_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-sm text-gray-900">{subscription.plan?.duration_months} month(s)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Fee</label>
                    <p className="text-sm font-medium text-gray-900">{subscription.plan?.total_fee && formatCurrency(subscription.plan.total_fee)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pause Days Allowed</label>
                    <p className="text-sm text-gray-900">{subscription.plan?.pause_days_allowed} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Personal Trainer Required</label>
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.need_trainer ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <span>✅</span> Yes
                        </span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Duration */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Subscription Duration</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-sm text-gray-900">{formatDateUtil(subscription.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Original End Date</label>
                  <p className="text-sm text-gray-900">{formatDateUtil(subscription.end_date)}</p>
                </div>
                {subscription.actual_end_date && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Actual End Date</label>
                    <p className="text-sm font-medium text-gray-900">{formatDateUtil(subscription.actual_end_date)}</p>
                    <p className="text-xs text-gray-500">Extended due to pause days used</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pause Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Pause Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pause Days Used</span>
                  <span className="text-sm font-medium">{subscription.pause_days_used} / {subscription.total_pause_days_allowed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(calculateProgress(subscription), subscription.pause_days_used > 0 ? 5 : 0)}%`,
                      minWidth: subscription.pause_days_used > 0 ? '8px' : '0px'
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="text-sm font-medium text-green-600">{subscription.pause_days_remaining} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Payment Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(subscription.amount_paid)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Mode</label>
                  <p className="text-sm text-gray-900 uppercase">{subscription.payment_mode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Receipt Number</label>
                  <p className="text-sm font-mono text-gray-900">{subscription.receipt_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created On</label>
                  <p className="text-sm text-gray-900">{formatDateUtil(subscription.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form Modal */}
        <SubscriptionForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleFormSuccess}
          subscription={subscription}
        />

        {/* Pause Reason Modal */}
        <PauseReasonModal
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          onConfirm={handlePause}
          loading={actionLoading}
        />

        {/* Resume Confirmation Modal */}
        <ConfirmModal
          isOpen={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          onConfirm={handleResume}
          title="Resume Subscription"
          message="Are you sure you want to resume this subscription? The end date will be extended based on the pause duration."
          confirmText="Resume"
          variant="info"
          loading={actionLoading}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Subscription"
          message="Are you sure you want to delete this subscription? This action cannot be undone and will permanently remove all subscription data."
          confirmText="Delete"
          variant="danger"
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
}