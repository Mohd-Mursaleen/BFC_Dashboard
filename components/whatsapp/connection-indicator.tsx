'use client';

import React, { useState } from 'react';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import { useWhatsAppStatus } from '@/lib/whatsapp-context';

export function WhatsAppConnectionIndicator() {
  const { isConnected, refreshStatus } = useWhatsAppStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <Link href="/whatsapp-broadcast">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            isConnected
              ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
              : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
          }`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Icons.whatsapp size={14} />
          <span className="font-semibold">
            {isConnected ? 'Active (WATI)' : 'Inactive'}
          </span>
          {!isConnected && (
            <span className="h-2 w-2 bg-red-500 rounded-full" />
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              refreshStatus();
            }}
            className="ml-1 hover:bg-black/5 rounded-full p-0.5 transition-colors"
          >
            <Icons.refresh size={10} />
          </button>
        </div>
      </Link>

      {/* Tooltip */}
      {showTooltip && (
        <div className={`absolute right-0 top-full mt-2 w-64 p-3 rounded-lg shadow-lg border z-50 ${
          isConnected
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-xs font-medium mb-1 ${
            isConnected ? 'text-green-900' : 'text-red-900'
          }`}>
            {isConnected ? '✓ WhatsApp Active (WATI)' : '⚠️ WhatsApp Inactive'}
          </div>
          <div className={`text-xs ${
            isConnected ? 'text-green-700' : 'text-red-700'
          }`}>
            {isConnected
              ? 'WhatsApp messaging is active via WATI. Template-based messages can be sent.'
              : 'WhatsApp service is currently inactive. Please check service status.'}
          </div>
          <div className="text-xs text-gray-600 mt-2 italic">
            Click to manage WhatsApp settings
          </div>
        </div>
      )}
    </div>
  );
}

