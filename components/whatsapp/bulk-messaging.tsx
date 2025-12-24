'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi, membersApi } from '@/lib/api';
import { Icons } from '@/lib/icons';
import type { Member } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useWhatsAppStatus } from '@/lib/whatsapp-context';

interface BulkSendResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    phone: string;
    name?: string;
    success: boolean;
    error?: string;
  }>;
}

export function BulkMessaging() {
  const { success: showSuccess, error: showError } = useNotification();
  const { isConnected } = useWhatsAppStatus();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Filtering
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Messaging
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BulkSendResult | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersApi.getAll();
      // Handle potential paginated response or direct array
      const data = Array.isArray(response) ? response : (response.data || []);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      showError('Failed to Load', 'Could not fetch members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on status and search query
  const filteredMembers = useMemo(() => {
    if (!Array.isArray(members)) return [];
    
    return members.filter(member => {
      // Status Filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && member.status !== 'active') return false;
        if (filterStatus === 'inactive' && member.status === 'active') return false;
      }

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          member.full_name.toLowerCase().includes(query) ||
          member.phone.includes(query) ||
          (member.email?.toLowerCase().includes(query) ?? false)
        );
      }

      return true;
    });
  }, [members, filterStatus, searchQuery]);

  // Selection Handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const sendBulkMessages = async () => {
    if (selectedIds.size === 0) {
      showError('No Recipients', 'Please select at least one member');
      return;
    }

    if (!message.trim()) {
      showError('No Message', 'Please enter a message to send');
      return;
    }

    setSending(true);
    setResult(null);

    const recipients = members
      .filter(m => selectedIds.has(m.id))
      .map(m => ({
        phone: m.phone,
        name: m.full_name
      }));

    try {
      const data = await whatsappApi.bulkSend({
        recipients,
        message
      });

      setResult(data);

      if (data.successful > 0) {
        showSuccess('Messages Sent!', `Successfully sent ${data.successful} out of ${data.total} messages`);
        setMessage(''); // Clear message on success
        setSelectedIds(new Set()); // Clear selection
      }

      if (data.failed > 0) {
        showError('Some Failed', `${data.failed} messages failed to send`);
      }
    } catch (error) {
      showError('WhatsApp Error', error instanceof Error ? error.message : 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Selection */}
        <Card className="lg:col-span-2 h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Icons.members size={20} />
                Select Recipients
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedIds.size} selected)
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-sm border rounded-md px-2 py-1 bg-white"
                >
                  <option value="active">Active Members</option>
                  <option value="inactive">Inactive Members</option>
                  <option value="all">All Members</option>
                </select>
              </div>
            </div>
            <div className="mt-2">
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-y text-sm font-medium text-gray-600">
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={filteredMembers.length > 0 && selectedIds.size === filteredMembers.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="col-span-4">Name</div>
                <div className="col-span-4">Phone</div>
                <div className="col-span-3">Status</div>
              </div>

              {/* Member List */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No members found matching your filters.</div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`grid grid-cols-12 gap-4 p-3 border-b hover:bg-gray-50 items-center text-sm ${
                        selectedIds.has(member.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="col-span-1 flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(member.id)}
                          onChange={() => toggleSelection(member.id)}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="col-span-4 font-medium">{member.full_name}</div>
                      <div className="col-span-4 text-gray-600">{member.phone}</div>
                      <div className="col-span-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Message Composer */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Icons.whatsapp size={20} />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi {name}, ..."
                  className="w-full h-64 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Use <strong>{'{name}'}</strong> to insert the member's name automatically.
                </p>
              </div>

              <Button
                onClick={sendBulkMessages}
                disabled={sending || selectedIds.size === 0 || !message.trim() || !isConnected}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Icons.refresh className="animate-spin mr-2" size={18} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icons.whatsapp className="mr-2" size={18} />
                    Send to {selectedIds.size} Member{selectedIds.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              
              {!isConnected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  ⚠️ WhatsApp is disconnected. Please connect to send messages.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-xs text-blue-700">Total Sent</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{result.successful}</div>
                <div className="text-xs text-green-700">Successful</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-xs text-red-700">Failed</div>
              </div>
            </div>

            {result.failed > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm">Failed Deliveries</div>
                <div className="max-h-60 overflow-y-auto">
                  {result.results.filter(r => !r.success).map((r, idx) => (
                    <div key={idx} className="px-4 py-2 border-b last:border-0 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{r.name || r.phone}</span>
                        <span className="text-gray-500 ml-2">{r.phone}</span>
                      </div>
                      <span className="text-red-600">{r.error || 'Unknown error'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
