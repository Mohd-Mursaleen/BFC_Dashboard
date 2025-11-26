'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Icons } from '@/lib/icons';
import { WhatsAppSessionManager } from '@/components/whatsapp/session-manager';
import { WhatsAppTestConnection } from '@/components/whatsapp/test-connection';
import { BulkMessaging } from '@/components/whatsapp/bulk-messaging';
import { WhatsAppStatusWidget } from '@/components/whatsapp/status-widget';
import { ExpiringMembersWidget } from '@/components/whatsapp/expiring-members';
import { whatsappApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WhatsAppBroadcastPage() {
  return (
    <ProtectedRoute>
      <WhatsAppBroadcastContent />
    </ProtectedRoute>
  );
}

function WhatsAppBroadcastContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Check initial status to determine view
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await whatsappApi.getSessionStatus();
        setIsConnected(data.status === 'WORKING');
        // If not connected, show settings by default
        if (data.status !== 'WORKING') {
          setShowSettings(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
  }, []);

  return (
    <Layout title="WhatsApp Broadcast">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Icons.whatsapp className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">WhatsApp Broadcast</h2>
              <p className="text-sm text-gray-500">Send bulk messages to your members</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <WhatsAppStatusWidget />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Icons.settings size={16} />
              {showSettings ? 'Hide Settings' : 'Connection Settings'}
            </Button>
          </div>
        </div>

        {/* Connection Settings (Collapsible) */}
        {showSettings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <WhatsAppSessionManager />
            <WhatsAppTestConnection />
          </div>
        )}

        {/* Main Content */}
        {isConnected || !showSettings ? (
          <div className="space-y-6">
            <ExpiringMembersWidget />
            <BulkMessaging />
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Icons.whatsapp className="text-gray-400" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp Not Connected</h3>
              <p className="text-gray-500 max-w-md mt-2 mb-6">
                Please connect your WhatsApp account using the settings panel above to start sending broadcast messages.
              </p>
              <Button onClick={() => setShowSettings(true)}>
                Connect WhatsApp
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
