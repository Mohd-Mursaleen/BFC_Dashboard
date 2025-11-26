'use client';

import React, { useState, useEffect } from 'react';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface SessionStatus {
  success: boolean;
  status: 'WORKING' | 'SCAN_QR_CODE' | 'STARTING' | 'STOPPED' | 'FAILED';
}

export function WhatsAppStatusWidget() {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await whatsappApi.getSessionStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
      setStatus({ success: false, status: 'FAILED' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    if (!status) return { color: 'bg-gray-100 text-gray-600', icon: Icons.refresh, text: 'Checking...' };
    
    switch (status.status) {
      case 'WORKING':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: Icons.success, text: 'Active' };
      case 'SCAN_QR_CODE':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Icons.qr, text: 'Scan QR' };
      case 'STARTING':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Icons.refresh, text: 'Starting...' };
      case 'STOPPED':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: Icons.expired, text: 'Disconnected' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Icons.expired, text: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${config.color}`}>
      <div className={`w-2 h-2 rounded-full ${status?.status === 'WORKING' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
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
