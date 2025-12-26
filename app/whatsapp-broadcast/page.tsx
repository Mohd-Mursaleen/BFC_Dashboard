'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { WhatsAppTestConnection } from '@/components/whatsapp/test-connection';
import { whatsappApi } from '@/lib/api';

export default function WhatsAppBroadcastPage() {
  return (
    <ProtectedRoute>
      <WhatsAppBroadcastContent />
    </ProtectedRoute>
  );
}

function WhatsAppBroadcastContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(true); // Show settings by default

  // Check service status
  const checkStatus = async () => {
    try {
      const data = await whatsappApi.getStatus();
      const nowConnected = data.status === 'ACTIVE';
      setIsConnected(nowConnected);
    } catch (e) {
      console.error(e);
      setIsConnected(false);
    }
  };

  return (
    <Layout title="WhatsApp Management">
      <div className="space-y-6">      

        {/* Settings Panel */}
        {showSettings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <WhatsAppTestConnection />
          </div>
        )}
            
      </div>
    </Layout>
  );
}