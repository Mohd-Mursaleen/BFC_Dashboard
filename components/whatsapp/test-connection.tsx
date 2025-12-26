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

interface ExpiryTestResponse {
  success?: boolean;
  message_id?: string;
  template_name?: string;
  phone: string;
  name: string;
  days_remaining: number;
  error?: string;
}

export function WhatsAppTestConnection() {
  const { success, error: showError } = useNotification();
  const [testPhone, setTestPhone] = useState('918218134534');
  const [testName, setTestName] = useState('Test User');
  const [daysRemaining, setDaysRemaining] = useState('7');
  const [testing, setTesting] = useState(false);
  const [testingExpiry, setTestingExpiry] = useState(false);
  const [result, setResult] = useState<WelcomeTestResponse | null>(null);
  const [expiryResult, setExpiryResult] = useState<ExpiryTestResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'welcome' | 'expiry'>('welcome');

  const testExpiryMessage = async () => {
    if (!testPhone.trim() || !testName.trim() || !daysRemaining.trim()) {
      showError('Invalid Input', 'Please enter phone number, name, and days remaining');
      return;
    }

    const days = parseInt(daysRemaining);
    if (isNaN(days) || days < 0) {
      showError('Invalid Input', 'Days remaining must be a valid number');
      return;
    }

    setTestingExpiry(true);
    setExpiryResult(null);
    
    try {
      const data = await whatsappApi.sendExpiry({
        member_phone: testPhone,
        member_name: testName,
        days_remaining: days
      });
      setExpiryResult(data);
      
      if (data.success) {
        success('Test Successful!', 'Expiry reminder template sent successfully');
      } else {
        const errorMsg = data.error || 'Failed to send expiry reminder';
        showError('WhatsApp Error', errorMsg);
      }
    } catch (error) {
      const errorResult: ExpiryTestResponse = {
        phone: testPhone,
        name: testName,
        days_remaining: days,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setExpiryResult(errorResult);
      
      // Handle specific error codes
      if (error instanceof Error) {
        if (error.message.includes('402')) {
          showError('Payment Required (402)', 'WATI API quota exceeded or payment required. Check your WATI account status.');
        } else if (error.message.includes('401')) {
          showError('Unauthorized (401)', 'WATI API authentication failed. Check your API token.');
        } else if (error.message.includes('404')) {
          showError('Template Not Found (404)', 'Expiry reminder template not found or not approved in WATI dashboard.');
        } else {
          showError('Test Failed', error.message);
        }
      } else {
        showError('Test Failed', 'Failed to test expiry reminder');
      }
    } finally {
      setTestingExpiry(false);
    }
  };

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
      
      // Handle specific error codes
      if (error instanceof Error) {
        if (error.message.includes('402')) {
          showError('Payment Required (402)', 'WATI API quota exceeded or payment required. Check your WATI account status.');
        } else if (error.message.includes('401')) {
          showError('Unauthorized (401)', 'WATI API authentication failed. Check your API token.');
        } else if (error.message.includes('404')) {
          showError('Template Not Found (404)', 'Welcome template not found or not approved in WATI dashboard.');
        } else {
          showError('Test Failed', error.message);
        }
      } else {
        showError('Test Failed', 'Failed to test welcome message');
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <h3 className="text-lg font-semibold">Test WhatsApp Templates</h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'welcome'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Welcome Template
          </button>
          <button
            onClick={() => setActiveTab('expiry')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'expiry'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expiry Reminder
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Phone Number
          </label>
          <Input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="918050022645"
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
            Name to be used in the template
          </p>
        </div>

        {/* Expiry-specific field */}
        {activeTab === 'expiry' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days Remaining
            </label>
            <Input
              type="number"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(e.target.value)}
              placeholder="7"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of days until subscription expires
            </p>
          </div>
        )}

        {/* Welcome Template Section */}
        {activeTab === 'welcome' && (
          <>
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
          </>
        )}

        {/* Expiry Reminder Section */}
        {activeTab === 'expiry' && (
          <>
            <Button 
              onClick={testExpiryMessage} 
              disabled={testingExpiry || !testPhone.trim() || !testName.trim() || !daysRemaining.trim()}
              className="w-full"
            >
              {testingExpiry ? (
                <>
                  <Icons.refresh className="animate-spin" size={16} />
                  Sending Test...
                </>
              ) : (
                <>
                  <Icons.whatsapp size={16} />
                  Send Expiry Reminder
                </>
              )}
            </Button>

            {expiryResult && (
              <div className={`rounded-lg p-4 ${
                expiryResult.success
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {expiryResult.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icons.success className="text-green-600" size={20} />
                      <span className="font-medium text-green-900">Expiry Reminder Sent!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Reminder sent to {expiryResult.name} ({expiryResult.phone}) - {expiryResult.days_remaining} days remaining
                    </p>
                    {expiryResult.template_name && (
                      <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                        <strong>Template:</strong> {expiryResult.template_name}
                      </div>
                    )}
                    {expiryResult.message_id && (
                      <div className="mt-2 p-2 bg-green-100 rounded text-xs font-mono text-green-800 break-all">
                        <strong>Message ID:</strong> {expiryResult.message_id}
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
                      {expiryResult.error || 'Failed to send expiry reminder'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This sends template messages via WATI. 
            Template content is managed in the WATI dashboard.
          </p>
        </div>

        {/* Common Errors Help */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-900 mb-1">Common Issues:</p>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• <strong>402 Error:</strong> WATI quota exceeded or payment required</li>
            <li>• <strong>401 Error:</strong> Invalid WATI API token</li>
            <li>• <strong>404 Error:</strong> Template not approved in WATI dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
