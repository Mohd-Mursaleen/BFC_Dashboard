'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingTable } from '@/components/ui/loading';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmModal } from '@/components/ui/modal';
import { useNotification } from '@/components/ui/notification';
import { MemberForm } from '@/components/forms/member-form';
import { membersApi } from '@/lib/api';
import { formatDate, calculateAge } from '@/lib/utils';
import type { Member } from '@/lib/types';
import { Icons } from '@/lib/icons';
import { BsPersonBadge, BsGenderMale, BsGenderFemale } from 'react-icons/bs';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { FiUser } from 'react-icons/fi';

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Modal states
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total: 0,
    total_pages: 1
  });

  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [pagination.page, pagination.page_size, statusFilter, genderFilter, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        page_size: pagination.page_size.toString(),
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (genderFilter !== 'all') params.gender = genderFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await membersApi.getAll(params);
      
      // Handle paginated response format: {data: Member[], pagination: {...}}
      if (response.data && response.pagination) {
        setMembers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          total_pages: response.pagination.total_pages
        }));
      } else {
        // Fallback for non-paginated response (shouldn't happen with updated API)
        const data = Array.isArray(response) ? response : (response.data || []);
        setMembers(data);
        setPagination(prev => ({
          ...prev,
          total: data.length,
          total_pages: 1
        }));
      }
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'suspended': return 'danger';
      default: return 'info';
    }
  };

  if (error) {
    return (
      <Layout title="Members">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <Icons.warning className="text-red-400 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading members</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchMembers}
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
    <Layout title="Members">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Members</h2>
            <p className="text-gray-600">Manage gym members and their information</p>
          </div>
          <Button variant="primary" onClick={handleAddMember}>
            <Icons.addMember size={18} />
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
                    setPagination(prev => ({ ...prev, page: 1 }));
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
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
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
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
                      onClick={() => {
                        setStatusFilter('active');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
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
                      onClick={() => {
                        setGenderFilter('all');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
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
                      onClick={() => {
                        setSearchTerm('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
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
                  Members ({pagination.total})
                </h3>
                <Button variant="outline" size="sm" onClick={fetchMembers}>
                  <Icons.refresh size={16} />
                  Refresh
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr 
                        key={member.id} 
                        onClick={() => window.location.href = `/members/${member.id}`}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {member.gender === 'male' ? (
                                <BsGenderMale className="text-blue-600" size={16} />
                              ) : member.gender === 'female' ? (
                                <BsGenderFemale className="text-pink-600" size={16} />
                              ) : (
                                <FiUser className="text-gray-600" size={16} />
                              )}
                              {member.full_name}
                            </div>
                            <div className="text-sm text-gray-500 ml-6">
                              {calculateAge(member.date_of_birth)} years old
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <HiOutlineMail className="text-gray-400" size={16} />
                            {member.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <HiOutlinePhone className="text-gray-400" size={16} />
                            {member.phone}
                          </div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {members.length === 0 && (
                  <div className="text-center py-12">
                    <Icons.members className="mx-auto mb-4 text-gray-400" size={64} />
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
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                pageSize={pagination.page_size}
                totalItems={pagination.total}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onPageSizeChange={(pageSize) => setPagination(prev => ({ ...prev, page_size: pageSize, page: 1 }))}
              />
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