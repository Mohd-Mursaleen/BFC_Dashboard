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
import { MemberForm } from '@/components/forms/member-form';
import { SubscriptionForm } from '@/components/forms/subscription-form';
import { membersApi, subscriptionsApi } from '@/lib/api';
import type { Member, Subscription } from '@/lib/types';

export default function MemberDetailPage() {
  return (
    <ProtectedRoute>
      <MemberDetailContent />
    </ProtectedRoute>
  );
}

function MemberDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const [member, setMember] = useState<Member | null>(null);
  const [memberSubscriptions, setMemberSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const memberId = params.id as string;

  useEffect(() => {
    if (memberId) {
      fetchMember();
      fetchMemberSubscriptions();
    }
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await membersApi.getById(memberId);
      setMember(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const allSubscriptions = await subscriptionsApi.getAll();
      // Filter subscriptions for this member
      const memberSubs = allSubscriptions.filter((sub: Subscription) => sub.member_id === memberId);
      setMemberSubscriptions(memberSubs);
    } catch (err) {
      console.error('Failed to fetch member subscriptions:', err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!member) return;

    setDeleteLoading(true);
    try {
      await membersApi.delete(member.id);
      success('Member Deleted', `${member.full_name} has been deleted successfully`);
      router.push('/members');
    } catch (err) {
      showError('Delete Failed', err instanceof Error ? err.message : 'Failed to delete member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchMember();
  };

  const handleAddSubscription = () => {
    setShowSubscriptionForm(true);
  };

  const handleSubscriptionSuccess = () => {
    fetchMemberSubscriptions();
  };

  const getSubscriptionStatusBadgeVariant = (subscription: Subscription) => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    
    if (endDate < today) return 'danger';
    if (subscription.is_currently_paused) return 'warning';
    return 'active';
  };

  const getSubscriptionStatusText = (subscription: Subscription) => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = subscription.actual_end_date || subscription.end_date;
    
    if (endDate < today) return 'Expired';
    if (subscription.is_currently_paused) return 'Paused';
    return 'Active';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'suspended': return 'danger';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Layout title="Member Details">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !member) {
    return (
      <Layout title="Member Details">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading member</h3>
              <p className="mt-2 text-sm text-red-700">{error || 'Member not found'}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={fetchMember}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/members')}
                  className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  Back to Members
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Member Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* <Button
              variant="outline"
              onClick={() => router.push('/members')}
              className="flex items-center gap-2"
            >
              ← Back to Members
            </Button> */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{member.full_name}</h2>
              <p className="text-gray-600">Member Details</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="success" onClick={handleAddSubscription}>
              <span>📝</span>
              Add Subscription
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              <span>✏️</span>
              Edit Member
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <span>🗑️</span>
              Delete Member
            </Button>
          </div>
        </div>

        {/* Member Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900">{member.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <Badge variant={getStatusBadgeVariant(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{member.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{member.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(member.date_of_birth)} ({calculateAge(member.date_of_birth)} years)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-sm text-gray-900 capitalize">
                    {member.gender === 'male' ? '👨 Male' : member.gender === 'female' ? '👩 Female' : '👤 Other'}
                  </p>
                </div>
              </div>
              
              {member.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900">{member.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Physical Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Physical Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {member.height && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Height</label>
                    <p className="text-sm text-gray-900">{member.height} cm</p>
                  </div>
                )}
                {member.weight && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-sm text-gray-900">{member.weight} kg</p>
                  </div>
                )}
                {member.preferred_gym_slot && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Preferred Gym Slot</label>
                    <p className="text-sm text-gray-900">{member.preferred_gym_slot}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          {member.medical_history && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <h3 className="text-lg font-semibold">Medical History</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(member.medical_history).map(([condition, hasCondition]) => (
                    hasCondition && (
                      <div key={condition} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                        <span className="text-orange-500">⚠️</span>
                        <span className="text-sm text-orange-800 capitalize">
                          {condition.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )
                  ))}
                </div>
                {!Object.values(member.medical_history).some(Boolean) && (
                  <p className="text-sm text-gray-500 italic">No medical conditions reported</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Membership Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Membership Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm text-gray-900">{formatDate(member.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(member.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Subscriptions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Subscriptions ({memberSubscriptions.length})</h3>
                <Button variant="success" size="sm" onClick={handleAddSubscription}>
                  <span>📝</span>
                  Add Subscription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : memberSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {memberSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={getSubscriptionStatusBadgeVariant(subscription)}>
                              {getSubscriptionStatusText(subscription)}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">
                              Receipt: {subscription.receipt_number}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <p className="font-medium">{formatDate(subscription.start_date)} - {formatDate(subscription.actual_end_date || subscription.end_date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <p className="font-medium">₹{subscription.amount_paid.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Payment:</span>
                              <p className="font-medium uppercase">{subscription.payment_mode}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Pause Days:</span>
                              <p className="font-medium">{subscription.pause_days_used} / {subscription.total_pause_days_allowed}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Subscriptions</h4>
                  <p className="text-gray-500 mb-4">This member doesn't have any subscriptions yet.</p>
                  <Button variant="success" onClick={handleAddSubscription}>
                    <span>📝</span>
                    Create First Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Form Modal */}
        <MemberForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleFormSuccess}
          member={member}
        />

        {/* Add Subscription Modal */}
        <SubscriptionForm
          isOpen={showSubscriptionForm}
          onClose={() => setShowSubscriptionForm(false)}
          onSuccess={handleSubscriptionSuccess}
          subscription={null}
          preSelectedMemberId={member?.id}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Member"
          message={`Are you sure you want to delete ${member.full_name}? This action cannot be undone and will also delete all associated subscriptions.`}
          confirmText="Delete"
          variant="danger"
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
}