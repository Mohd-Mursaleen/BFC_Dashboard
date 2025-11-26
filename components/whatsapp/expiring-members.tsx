'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';
import type { ExpiringSubscription } from '@/lib/types';
import { HiOutlinePhone } from 'react-icons/hi';

export function ExpiringMembersWidget() {
  const { success, error: showError } = useNotification();
  const [expiring, setExpiring] = useState<ExpiringSubscription[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchExpiring();
  }, [days]);

  const fetchExpiring = async () => {
    setLoading(true);
    try {
      const data = await whatsappApi.getExpiringSubscriptions(days);
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
    if (selectedIds.size === expiring.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expiring.map(s => s.subscription_id)));
    }
  };

  const sendReminders = async () => {
    if (selectedIds.size === 0) {
      showError('No Selection', 'Please select at least one member');
      return;
    }

    setSending(true);
    try {
      // Prepare recipients list
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
      showError('Send Failed', error instanceof Error ? error.message : 'Failed to send reminders');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h3 className="text-lg font-semibold">Expiring Subscriptions</h3>
              <p className="text-sm text-gray-600">Send reminders to members expiring soon</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>Next 3 days</option>
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
            </select>
            <Button
              onClick={sendReminders}
              disabled={sending || selectedIds.size === 0}
              variant="success"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {sending ? (
                <>
                  <Icons.refresh className="animate-spin mr-2" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  <Icons.whatsapp className="mr-2" size={16} />
                  Send Reminders ({selectedIds.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : expiring.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>{expiring.length}</strong> member{expiring.length > 1 ? 's' : ''} expiring in the next {days} days
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size === expiring.length && expiring.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm text-gray-700 cursor-pointer select-none">
                  Select All
                </label>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {expiring.map((sub) => (
                <div
                  key={sub.subscription_id}
                  className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                    selectedIds.has(sub.subscription_id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSelection(sub.subscription_id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.subscription_id)}
                        onChange={() => toggleSelection(sub.subscription_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{sub.member_name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <HiOutlinePhone size={14} />
                            {sub.member_phone}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sub.days_remaining <= 3
                              ? 'bg-red-100 text-red-800'
                              : sub.days_remaining <= 7
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sub.days_remaining} {sub.days_remaining === 1 ? 'day' : 'days'} left
                          </span>
                          <span className="text-xs text-gray-500">
                            Ends: {new Date(sub.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-medium">No Expiring Subscriptions</p>
            <p className="text-sm mt-1">No memberships expiring in the next {days} days</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
