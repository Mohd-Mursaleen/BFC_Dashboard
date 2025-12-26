'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Layout } from '@/components/layout/layout';
import { Icons } from '@/lib/icons';
import { WhatsAppSessionManager } from '@/components/whatsapp/session-manager';
import { WhatsAppTestConnection } from '@/components/whatsapp/test-connection';
import { WhatsAppStatusWidget } from '@/components/whatsapp/status-widget';
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Icons.whatsapp className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">WhatsApp Management</h2>
              <p className="text-sm text-gray-500">Manage WhatsApp service and test messaging</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <WhatsAppStatusWidget />
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkStatus}
              className="flex items-center gap-2"
            >
              <Icons.refresh size={16} />
              Check Status
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Icons.settings size={16} />
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <WhatsAppSessionManager />
            <WhatsAppTestConnection />
          </div>
        )}

        {/* Service Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Icons.whatsapp className="text-blue-600" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">WATI Integration Active</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• WhatsApp messaging is now powered by WATI (official WhatsApp Business API)</p>
                  <p>• Only template-based messages are supported for compliance</p>
                  <p>• Welcome messages are automatically sent to new members</p>
                  <p>• Template content is managed in the WATI dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temporarily Disabled Features */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Icons.warning className="text-yellow-600" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Temporarily Disabled Features</h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p>• <strong>Bulk Messaging:</strong> Will be implemented with template support</p>
                  <p>• <strong>Expiry Reminders:</strong> Being migrated to template-based system</p>
                  <p>• <strong>Free Text Messages:</strong> Not supported in official WhatsApp Business API</p>
                  <p>• <strong>Image Messages:</strong> Will be added in future updates</p>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    <strong>Note:</strong> These features will be re-enabled as we implement template-based alternatives 
                    that comply with WhatsApp Business API requirements.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}