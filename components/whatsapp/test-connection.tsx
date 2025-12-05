'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';
import type { WhatsAppTestResponse } from '@/lib/types';

export function WhatsAppTestConnection() {
  const { success, error: showError } = useNotification();
  const [testPhone, setTestPhone] = useState('919987654321');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<WhatsAppTestResponse | null>(null);

  const testConnection = async () => {
    if (!testPhone.trim()) {
      showError('Invalid Input', 'Please enter a phone number');
      return;
    }

    setTesting(true);
    setResult(null);
    
    try {
      const data = await whatsappApi.test(testPhone);
      setResult(data);
      
      if (data.connection_status === 'success') {
        success('Test Successful!', 'WhatsApp message sent successfully');
      } else {
        showError('Test Failed', data.details?.error || 'Failed to send test message');
      }
    } catch (error) {
      const errorResult: WhatsAppTestResponse = {
        test_phone: testPhone,
        connection_status: 'failed',
        details: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      setResult(errorResult);
      showError('Test Failed', error instanceof Error ? error.message : 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <h3 className="text-lg font-semibold">Test WhatsApp Connection</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Phone Number
          </label>
          <Input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="918218134535"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: Country code + number (e.g., 918218134535 for India)
          </p>
        </div>

        <Button 
          onClick={testConnection} 
          disabled={testing || !testPhone.trim()}
          className="w-full"
        >
          {testing ? (
            <>
              <Icons.refresh className="animate-spin" size={16} />
              Sending Test...
            </>
          ) : (
            <>
              <Icons.whatsapp size={16} />
              Send Test Message
            </>
          )}
        </Button>

        {result && (
          <div className={`rounded-lg p-4 ${
            result.connection_status === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.connection_status === 'success' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.success className="text-green-600" size={20} />
                  <span className="font-medium text-green-900">Test Message Sent!</span>
                </div>
                <p className="text-sm text-green-700">
                  Message successfully sent to {result.test_phone}
                </p>
                {result.details?.message_id && (
                  <div className="mt-2 p-2 bg-green-100 rounded text-xs font-mono text-green-800 break-all">
                    Message ID: {result.details.message_id}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.expired className="text-red-600" size={20} />
                  <span className="font-medium text-red-900">Test Failed</span>
                </div>
                <p className="text-sm text-red-700">
                  {result.details?.error || 'Failed to send test message'}
                </p>
                {result.details?.status_code && (
                  <p className="text-xs text-red-600">
                    Status Code: {result.details.status_code}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This will send a test message to verify your WhatsApp connection is working properly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
