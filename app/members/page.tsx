'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingTable } from '@/components/ui/loading';
import { ConfirmModal } from '@/components/ui/modal';
import { useNotification } from '@/components/ui/notification';
import { MemberForm } from '@/components/forms/member-form';
import { membersApi } from '@/lib/api';
import type { Member } from '@/lib/types';

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <MembersContent />
    </ProtectedRoute>
  );
}

function MembersContent() {
  const { success, error: showError } = useNotification();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Modal states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Always fetch all members and filter on client side for better UX
      const response = await membersApi.getAll();
      setMembers(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberForm(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleDeleteMember = (member: Member) => {
    setDeletingMember(member);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;

    setDeleteLoading(true);
    try {
      await membersApi.delete(deletingMember.id);
      success('Member Deleted', `${deletingMember.full_name} has been deleted successfully`);
      fetchMembers();
      setShowDeleteConfirm(false);
      setDeletingMember(null);
    } catch (err) {
      showError('Delete Failed', err instanceof Error ? err.message : 'Failed to delete member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchMembers();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesGender = genderFilter === 'all' || member.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'suspended': return 'danger';
      default: return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (error) {
    return (
      <Layout title="Members">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading members</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchMembers}
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
    <Layout title="Members">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Members</h2>
            <p className="text-gray-600">Manage gym members and their information</p>
          </div>
          <Button variant="primary" onClick={handleAddMember}>
            <span>👤</span>
            Add Member
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              {(statusFilter !== 'active' || genderFilter !== 'all' || searchTerm) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('active');
                    setGenderFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Search"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active Members' },
                  { value: 'inactive', label: 'Inactive Members' },
                  // { value: 'suspended', label: 'Suspended Members' },
                ]}
              />
              <Select
                label="Gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Genders' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
            
            {/* Active Filters Display */}
            {(statusFilter !== 'active' || genderFilter !== 'all' || searchTerm) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {statusFilter !== 'active' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Status: {statusFilter === 'all' ? 'All' : statusFilter}
                    <button
                      onClick={() => setStatusFilter('active')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {genderFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                    Gender: {genderFilter}
                    <button
                      onClick={() => setGenderFilter('all')}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Table */}
        {loading ? (
          <LoadingTable rows={8} columns={6} />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Members ({filteredMembers.length})
                </h3>
                <Button variant="outline" size="sm" onClick={fetchMembers}>
                  🔄 Refresh
                </Button>
              </div>
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
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        View Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <button
                              onClick={() => window.location.href = `/members/${member.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {member.full_name}
                            </button>
                            <div className="text-sm text-gray-500">
                              {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'} 
                              {' '}{calculateAge(member.date_of_birth)} years
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.email}</div>
                          <div className="text-sm text-gray-500">{member.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.height && member.weight && (
                              <>
                                {member.height}cm, {member.weight}kg
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.preferred_gym_slot && (
                              <span>{member.preferred_gym_slot}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(member.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/members/${member.id}`}
                            className="flex items-center gap-2"
                          >
                            <span>👁️</span>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || statusFilter !== 'active' || genderFilter !== 'all'
                        ? `No members match your current filters${statusFilter === 'active' ? ' (showing active members)' : ''}`
                        : 'No active members found. Try changing the status filter or add your first member.'
                      }
                    </p>
                    {(searchTerm || statusFilter !== 'active' || genderFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusFilter('active');
                          setGenderFilter('all');
                          setSearchTerm('');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Member Form Modal */}
        <MemberForm
          isOpen={showMemberForm}
          onClose={() => setShowMemberForm(false)}
          onSuccess={handleFormSuccess}
          member={editingMember}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Member"
          message={`Are you sure you want to delete ${deletingMember?.full_name}? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
}