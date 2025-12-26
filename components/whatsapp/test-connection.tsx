'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface WelcomeTestResponse {
  test_result?: {
    success: boolean;
    message_id?: string;
    template_name?: string;
    phone: string;
  };
  phone: string;
  name: string;
  template?: string;
  success?: boolean;
  error?: string;
}

export function WhatsAppTestConnection() {
  const { success, error: showError } = useNotification();
  const [testPhone, setTestPhone] = useState('918218134534');
  const [testName, setTestName] = useState('Test User');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<WelcomeTestResponse | null>(null);

  const testWelcomeMessage = async () => {
    if (!testPhone.trim() || !testName.trim()) {
      showError('Invalid Input', 'Please enter both phone number and name');
      return;
    }

    setTesting(true);
    setResult(null);
    
    try {
      const data = await whatsappApi.testWelcome({
        member_phone: testPhone,
        member_name: testName
      });
      setResult(data);
      
      if (data.test_result?.success || data.success) {
        success('Test Successful!', 'Welcome template message sent successfully');
      } else {
        const errorMsg = data.error || data.test_result?.error || 'Failed to send test message';
        showError('WhatsApp Error', errorMsg);
      }
    } catch (error) {
      const errorResult: WelcomeTestResponse = {
        phone: testPhone,
        name: testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setResult(errorResult);
      showError('Test Failed', error instanceof Error ? error.message : 'Failed to test welcome message');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <h3 className="text-lg font-semibold">Test Welcome Template</h3>
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
            placeholder="918218134534"
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: Country code + number (e.g., 918218134534 for India)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Name
          </label>
          <Input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Test User"
          />
          <p className="text-xs text-gray-500 mt-1">
            Name to be used in the welcome template
          </p>
        </div>

        <Button 
          onClick={testWelcomeMessage} 
          disabled={testing || !testPhone.trim() || !testName.trim()}
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
              Send Welcome Template
            </>
          )}
        </Button>

        {result && (
          <div className={`rounded-lg p-4 ${
            result.test_result?.success || result.success
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.test_result?.success || result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.success className="text-green-600" size={20} />
                  <span className="font-medium text-green-900">Welcome Template Sent!</span>
                </div>
                <p className="text-sm text-green-700">
                  Template message successfully sent to {result.phone}
                </p>
                {result.test_result?.template_name && (
                  <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                    <strong>Template:</strong> {result.test_result.template_name}
                  </div>
                )}
                {result.test_result?.message_id && (
                  <div className="mt-2 p-2 bg-green-100 rounded text-xs font-mono text-green-800 break-all">
                    <strong>Message ID:</strong> {result.test_result.message_id}
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
                  {result.error || 'Failed to send welcome template'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This sends a welcome template message via WATI. 
            The template content is managed in the WATI dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
