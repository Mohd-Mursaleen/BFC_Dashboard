'use client';

import React, { useState } from 'react';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import { useWhatsAppStatus } from '@/lib/whatsapp-context';

export function WhatsAppConnectionIndicator() {
  const { isConnected } = useWhatsAppStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <Link href="/whatsapp-broadcast">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
            isConnected
              ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
              : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 animate-pulse'
          }`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Icons.whatsapp size={14} />
          <span className="font-semibold">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {!isConnected && (
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
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
            {isConnected ? '✓ WhatsApp Active' : '⚠️ WhatsApp Inactive'}
          </div>
          <div className={`text-xs ${
            isConnected ? 'text-green-700' : 'text-red-700'
          }`}>
            {isConnected
              ? 'All WhatsApp features are operational. Reminders and messages can be sent.'
              : 'WhatsApp features are unavailable. Please connect your WhatsApp to enable messaging functionality.'}
          </div>
          <div className="text-xs text-gray-600 mt-2 italic">
            Click to manage connection
          </div>
        </div>
      )}
    </div>
  );
}

