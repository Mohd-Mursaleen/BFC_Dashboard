'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi, membersApi, plansApi } from '@/lib/api';
import type { Member, Plan, WhatsAppTemplate, BulkSendResult } from '@/lib/types';

export default function WhatsAppBroadcastPage() {
  return (
    <ProtectedRoute>
      <WhatsAppBroadcastContent />
    </ProtectedRoute>
  );
}

function WhatsAppBroadcastContent() {
  const { success, error: showError } = useNotification();
  
  // State management
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Filter states
  const [memberStatus, setMemberStatus] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  
  // Template states
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  
  // Results
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [sendResults, setSendResults] = useState<BulkSendResult | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, memberStatus, planFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [templatesData, membersData, plansData] = await Promise.all([
        whatsappApi.getTemplates(),
        membersApi.getAll(),
        plansApi.getAll()
      ]);
      
      setTemplates(templatesData.templates || []);
      setMembers(membersData);
      setPlans(plansData);
    } catch (err) {
      showError('Failed to Load Data', err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];
    
    // Filter by member status
    if (memberStatus !== 'all') {
      filtered = filtered.filter(m => m.status === memberStatus);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.full_name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query)
      );
    }
    
    setFilteredMembers(filtered);
  };

  const handleSelectAll = () => {
    const newSelected = new Set(selectedMemberIds);
    filteredMembers.forEach(member => newSelected.add(member.id));
    setSelectedMemberIds(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedMemberIds(new Set());
  };

  const handleToggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMemberIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMemberIds(newSelected);
  };

  const getSelectedMembers = (): Member[] => {
    return members.filter(m => selectedMemberIds.has(m.id));
  };

  const handleTemplateSelect = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    setSelectedTemplate(template || null);
    setSendResults(null);
  };

  const buildRecipients = () => {
    const selectedMembers = getSelectedMembers();
    return selectedMembers.map(member => ({
      phone: member.phone,
      parameters: {
        member_name: member.full_name,
        subscription_expiry_date: "N/A" // TODO: Fetch from subscription data
      }
    }));
  };

  const handleSendMessages = async () => {
    if (!selectedTemplate) {
      showError('No Template Selected', 'Please select a template first');
      return;
    }
    
    if (selectedMemberIds.size === 0) {
      showError('No Recipients Selected', 'Please select at least one member');
      return;
    }

    setSending(true);
    try {
      const recipients = buildRecipients();
      
      const result = await whatsappApi.bulkSend({
        template_name: selectedTemplate.name,
        language_code: selectedTemplate.language,
        recipients
      });
      
      setSendResults(result);
      
      if (result.successful > 0) {
        success(
          'Messages Sent',
          `Successfully sent ${result.successful} out of ${result.total} messages`
        );
      }
      
      if (result.failed > 0) {
        showError(
          'Some Messages Failed',
          `${result.failed} messages failed to send. Check results below.`
        );
      }
    } catch (err) {
      showError('Send Failed', err instanceof Error ? err.message : 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout title="WhatsApp Broadcast">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');
  const selectedMembers = getSelectedMembers();

  return (
    <Layout title="WhatsApp Broadcast">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📱 WhatsApp Broadcast</h2>
            <p className="text-gray-600">Select members and send bulk WhatsApp messages</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{selectedMemberIds.size}</div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Member Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter & Search */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">1️⃣ Filter & Select Members</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Status
                    </label>
                    <Select
                      value={memberStatus}
                      onChange={(e) => setMemberStatus(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Members' },
                        { value: 'active', label: 'Active Only' },
                        { value: 'inactive', label: 'Inactive Only' },
                        { value: 'suspended', label: 'Suspended Only' },
                      ]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Members
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, phone..."
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-600">
                    Showing {filteredMembers.length} members
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      ✓ Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                      ✕ Deselect All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member List with Checkboxes */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Select Recipients</h3>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleToggleMember(member.id)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedMemberIds.has(member.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.has(member.id)}
                          onChange={() => handleToggleMember(member.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{member.full_name}</div>
                          <div className="text-sm text-gray-600">📱 {member.phone}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : member.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredMembers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      <p>No members found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Select Template */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">2️⃣ Choose Template & Send</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Template
                  </label>
                  <Select
                    value={selectedTemplate?.name || ''}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    options={[
                      { value: '', label: 'Select a template...' },
                      ...approvedTemplates.map(template => ({
                        value: template.name,
                        label: `${template.name} (${template.language})`
                      }))
                    ]}
                  />
                </div>

                {selectedTemplate && (
                  <div className="space-y-4">
                    {/* Template Preview */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-xs font-medium text-green-700 mb-2">
                        TEMPLATE PREVIEW
                      </div>
                      {selectedTemplate.components?.map((component, idx) => (
                        component.type === 'BODY' && (
                          <div key={idx} className="text-sm text-gray-800 whitespace-pre-wrap">
                            {component.text}
                          </div>
                        )
                      ))}
                    </div>

                    {/* Auto Parameters Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-xs font-medium text-blue-700 mb-2">
                        ✓ AUTO PARAMETERS
                      </div>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>• <strong>member_name</strong> → Member's full name</div>
                        <div>• <strong>subscription_expiry_date</strong> → Subscription end date</div>
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        These will be automatically filled for each member
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Button */}
            {selectedMemberIds.size > 0 && selectedTemplate && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={handleSendMessages}
                    loading={sending}
                    disabled={sending}
                  >
                    {sending ? 'Sending Messages...' : `📱 Send to ${selectedMemberIds.size} Selected Members`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Selected Members & Results */}
          <div className="space-y-6">
            {/* Selected Members Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Selected Members ({selectedMemberIds.size})</h3>
              </CardHeader>
              <CardContent>
                {selectedMemberIds.size > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {selectedMembers.slice(0, 10).map(member => (
                      <div key={member.id} className="border border-blue-200 bg-blue-50 rounded-lg p-3 text-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{member.full_name}</div>
                            <div className="text-xs text-gray-600">📱 {member.phone}</div>
                          </div>
                          <button
                            onClick={() => handleToggleMember(member.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedMemberIds.size > 10 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        +{selectedMemberIds.size - 10} more selected
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">✓</div>
                    <p className="text-sm">No members selected</p>
                    <p className="text-xs mt-1">Check members from the list</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Results */}
            {sendResults && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Send Results</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{sendResults.total}</div>
                      <div className="text-xs text-blue-700">Total</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{sendResults.successful}</div>
                      <div className="text-xs text-green-700">Sent</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{sendResults.failed}</div>
                      <div className="text-xs text-red-700">Failed</div>
                    </div>
                  </div>

                  {sendResults.results && sendResults.results.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {sendResults.results.map((result, idx) => (
                        <div
                          key={idx}
                          className={`border rounded-lg p-2 text-xs ${
                            result.success
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.phone}</span>
                            <span>{result.success ? '✅' : '❌'}</span>
                          </div>
                          {result.error && (
                            <div className="text-red-600 mt-1">{result.error}</div>
                          )}
                          {result.message_id && (
                            <div className="text-green-600 mt-1 font-mono">
                              ID: {result.message_id.slice(0, 20)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-xl">💡</span>
              <div className="text-sm text-blue-800">
                <strong>Tips:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Only APPROVED templates can be sent</li>
                  <li>Test with a small group before sending to all members</li>
                  <li>Parameters are automatically mapped to member data</li>
                  <li>Failed messages will show detailed error reasons</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
