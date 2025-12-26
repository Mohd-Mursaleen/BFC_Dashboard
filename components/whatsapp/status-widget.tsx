'use client';

import React, { useState } from 'react';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface WhatsAppStatus {
  success: boolean;
  status: 'ACTIVE' | 'DISABLED';
  service?: string;
}

export function WhatsAppStatusWidget() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await whatsappApi.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
      setStatus({ success: false, status: 'DISABLED' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = () => {
    if (!status) return { color: 'bg-gray-100 text-gray-600', icon: Icons.refresh, text: 'Unknown' };
    
    switch (status.status) {
      case 'ACTIVE':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: Icons.success, text: `Active (${status.service || 'WATI'})` };
      case 'DISABLED':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: Icons.expired, text: 'Disabled' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Icons.expired, text: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${config.color}`}>
      <div className={`w-2 h-2 rounded-full ${status?.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
      <span>{config.text}</span>
      <button 
        onClick={checkStatus} 
        disabled={loading}
        className="ml-1 hover:bg-black/5 rounded-full p-0.5 transition-colors"
      >
        <Icons.refresh size={12} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
