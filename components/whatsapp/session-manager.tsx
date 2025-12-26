'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface WhatsAppStatus {
  success: boolean;
  status: 'ACTIVE' | 'DISABLED';
  service?: string;
  message?: string;
}

export function WhatsAppSessionManager() {
  const { success: showSuccess, error: showError } = useNotification();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const data = await whatsappApi.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
      setStatus({ success: false, status: 'DISABLED', message: 'Failed to check status' });
    } finally {
      setChecking(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800', icon: '❓' };
    
    switch (status.status) {
      case 'ACTIVE':
        return { text: `Active (${status.service || 'WATI'})`, className: 'bg-green-100 text-green-800', icon: '✅' };
      case 'DISABLED':
        return { text: 'Disabled', className: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { text: 'Unknown', className: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icons.whatsapp className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold">WhatsApp Service Status</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Service Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.className}`}>
            {statusBadge.icon} {statusBadge.text}
          </span>
        </div>

        {/* Check Status Button */}
        <Button 
          onClick={checkStatus} 
          disabled={checking}
          variant="outline"
          className="w-full"
        >
          {checking ? (
            <>
              <LoadingSpinner size="sm" />
              Checking Status...
            </>
          ) : (
            <>
              <Icons.refresh size={16} />
              Check Status
            </>
          )}
        </Button>

        {/* Status Message */}
        {status?.message && (
          <div className={`rounded-lg p-4 ${
            status.status === 'ACTIVE' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{status.status === 'ACTIVE' ? '✅' : '⚠️'}</span>
              <div>
                <p className={`font-medium ${
                  status.status === 'ACTIVE' ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {status.status === 'ACTIVE' ? 'WhatsApp Service Active' : 'WhatsApp Service Status'}
                </p>
                <p className={`text-sm mt-1 ${
                  status.status === 'ACTIVE' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {status.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Service Information */}
        {status?.status === 'ACTIVE' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> WhatsApp messaging is now powered by WATI (official WhatsApp Business API). 
              Only template-based messages are supported for compliance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
