'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';
import type { ExpiringSubscription } from '@/lib/types';
import { useWhatsAppStatus } from '@/lib/whatsapp-context';

export function ExpiringMembersWidget() {
  const { success, error: showError } = useNotification();
  const { isConnected } = useWhatsAppStatus();
  const [expiring, setExpiring] = useState<ExpiringSubscription[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Always fetch for next 7 days
  const DAYS_THRESHOLD = 7;

  useEffect(() => {
    fetchExpiring();
  }, []);

  const fetchExpiring = async () => {
    setLoading(true);
    try {
      const data = await whatsappApi.getExpiringSubscriptions(DAYS_THRESHOLD);
      setExpiring(data.subscriptions || []);
      // Auto-select all by default
      if (data.subscriptions) {
        setSelectedIds(new Set(data.subscriptions.map((s: ExpiringSubscription) => s.subscription_id)));
      }
    } catch (error) {
      showError('Failed to Load', 'Could not fetch expiring subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpiring = useMemo(() => {
    if (!searchTerm.trim()) return expiring;
    const query = searchTerm.toLowerCase();
    return expiring.filter(sub => 
      sub.member_name.toLowerCase().includes(query) || 
      sub.member_phone.includes(query)
    );
  }, [expiring, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = expiring.length;
    const critical = expiring.filter(s => s.days_remaining <= 3).length;
    const warning = total - critical;
    return { total, critical, warning };
  }, [expiring]);

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
    if (selectedIds.size === filteredExpiring.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpiring.map(s => s.subscription_id)));
    }
  };

  const sendReminders = async () => {
    if (selectedIds.size === 0) {
      showError('No Selection', 'Please select at least one member');
      return;
    }

    setSending(true);
    try {
      const recipients = expiring
        .filter(sub => selectedIds.has(sub.subscription_id))
        .map(sub => ({
          name: sub.member_name,
          phone: sub.member_phone,
          end_date: sub.end_date,
          days_remaining: sub.days_remaining
        }));

      const data = await whatsappApi.sendExpiryReminders(recipients);
      
      if (data.success) {
        success(
          'Reminders Sent!',
          `Successfully sent ${data.reminders_sent} reminder${data.reminders_sent > 1 ? 's' : ''}`
        );
      }
      
      if (data.reminders_failed > 0) {
        showError(
          'Some Failed',
          `${data.reminders_failed} reminder${data.reminders_failed > 1 ? 's' : ''} failed to send`
        );
      }
    } catch (error) {
      showError('WhatsApp Error', error instanceof Error ? error.message : 'Failed to send reminders');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📱 WhatsApp Reminders - Expiring Soon</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icons.whatsapp className="text-green-600" size={28} />
            <div>
              <h3 className="text-lg font-semibold">WhatsApp Reminders - Expiring Soon</h3>
              <p className="text-sm text-gray-600">Members with subscriptions expiring in the next {DAYS_THRESHOLD} days</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchExpiring}
              disabled={loading}
            >
              <Icons.refresh className="mr-2" size={16} />
              Refresh
            </Button>
            <Button
              onClick={sendReminders}
              disabled={sending || selectedIds.size === 0 || !isConnected}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {sending ? (
                <>
                  <Icons.refresh className="animate-spin mr-2" size={14} />
                  Sending...
                </>
              ) : (
                <>
                  <Icons.whatsapp className="mr-2" size={14} />
                  Send ({selectedIds.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            ⚠️ WhatsApp is disconnected. Please connect to send reminders.
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.total}</div>
                <div className="text-sm text-orange-700">Expiring in 7 days</div>
              </div>
              <Icons.clock className="text-orange-400" size={48} />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-sm text-red-700">Critical (≤3 days)</div>
              </div>
              <Icons.bell className="text-red-400" size={48} />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{stats.warning}</div>
                <div className="text-sm text-yellow-700">Warning (4-7 days)</div>
              </div>
              <Icons.warning className="text-yellow-400" size={48} />
            </div>
          </div>
        </div>

        {expiring.length > 0 ? (
          <>
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Select All Checkbox */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredExpiring.length && filteredExpiring.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredExpiring.length})
              </span>
            </div>

            {/* Members List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredExpiring.map((sub) => {
                const isUrgent = sub.days_remaining <= 3;
                const isSelected = selectedIds.has(sub.subscription_id);
                return (
                  <div 
                    key={sub.subscription_id} 
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      isUrgent 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-yellow-300 bg-yellow-50'
                    } ${isSelected ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => toggleSelection(sub.subscription_id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(sub.subscription_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-900">{sub.member_name}</div>
                            {isUrgent && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded-full">
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <Icons.phone size={14} />
                            {sub.member_phone}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Icons.calendar size={12} />
                            Expires: {sub.end_date}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-2xl font-bold ${
                            isUrgent ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {sub.days_remaining}
                          </div>
                          <div className="text-xs text-gray-600">days left</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredExpiring.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-600">No members found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Icons.success className="mx-auto mb-4 text-green-500" size={64} />
            <p className="text-lg font-medium text-gray-900">All Clear!</p>
            <p className="text-sm text-gray-600 mt-2">No subscriptions expiring in the next {DAYS_THRESHOLD} days</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <Icons.bell className="text-blue-600" size={16} />
          <span>Reminders are sent automatically daily at 10:00 AM IST</span>
        </div>
      </CardContent>
    </Card>
  );
}
