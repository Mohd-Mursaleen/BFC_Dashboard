'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNotification } from '@/components/ui/notification';
import { whatsappApi } from '@/lib/api';
import { Icons } from '@/lib/icons';

interface SessionStatus {
  success: boolean;
  status: 'WORKING' | 'SCAN_QR_CODE' | 'STARTING' | 'STOPPED' | 'FAILED';
  session_data?: {
    name: string;
    status: string;
  };
}

export function WhatsAppSessionManager() {
  const { success: showSuccess, error: showError } = useNotification();
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isFetchingQR, setIsFetchingQR] = useState(false);
  
  // Track previous status to detect changes
  const prevStatusRef = React.useRef<string | null>(null);

  useEffect(() => {
    checkStatus();
    // Poll status every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const data = await whatsappApi.getSessionStatus();
      setStatus(data);
      
      // Check for status change to WORKING
      if (prevStatusRef.current !== 'WORKING' && data.status === 'WORKING') {
        setQrCode(null);
        showSuccess('Connected!', 'WhatsApp session is now active');
      }
      
      // Update previous status
      prevStatusRef.current = data.status;
      
      // If status is SCAN_QR_CODE and we don't have QR yet, fetch it
      // Use guard to prevent concurrent fetches
      if (data.status === 'SCAN_QR_CODE' && !qrCode && !isFetchingQR) {
        fetchQRCode();
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setChecking(false);
    }
  };

  const fetchQRCode = async () => {
    if (isFetchingQR) return; // Prevent concurrent fetches
    
    setIsFetchingQR(true);
    try {
      const qrImageUrl = await whatsappApi.getSessionQR();
      setQrCode(qrImageUrl);
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
      
      // Handle race condition: User scanned QR while we were fetching
      if (error instanceof Error && (error.message.includes('500') || error.message.includes('No input text'))) {
        console.log('QR fetch failed - likely session was authenticated. Waiting for next poll...');
        setQrCode(null);
        // Do NOT call checkStatus() immediately to avoid rapid loops.
        // The interval will pick up the new status in <2s.
      } else if (error instanceof Error && error.message.includes('404')) {
        showError('QR Not Ready', 'QR code not available yet. Please wait a moment and the page will retry automatically.');
      } else {
        showError('QR Fetch Failed', error instanceof Error ? error.message : 'Could not fetch QR code');
      }
    } finally {
      setIsFetchingQR(false);
    }
  };

  const startSession = async () => {
    setLoading(true);
    setQrCode(null);
    // Optimistically update status to show feedback immediately
    setStatus({ success: true, status: 'STARTING' });
    
    try {
      await whatsappApi.startSession();
      showSuccess('Starting...', 'WhatsApp session is starting');
      
      // Check status immediately to catch the transition
      await checkStatus();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start session';
      showError('WhatsApp Error', errorMsg);
      // Revert status on error
      checkStatus();
    } finally {
      setLoading(false);
    }
  };

  const stopSession = async () => {
    try {
      await whatsappApi.stopSession();
      showSuccess('Stopped', 'WhatsApp session stopped');
      setQrCode(null);
      checkStatus();
    } catch (error) {
      showError('Failed to Stop', error instanceof Error ? error.message : 'Failed to stop session');
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Backend now handles logout + automatic session restart
      await whatsappApi.logoutSession();
      showSuccess('Logged Out', 'Session logged out. A new session has been started. Please scan the QR code.');
      setQrCode(null);
      
      // Check status immediately - backend has already started new session
      await checkStatus();
      
      // If status is SCAN_QR_CODE, the checkStatus will trigger QR fetch automatically
    } catch (error) {
      showError('Failed to Logout', error instanceof Error ? error.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return { text: 'Checking...', className: 'bg-gray-100 text-gray-800', icon: '⏳' };
    
    switch (status.status) {
      case 'WORKING':
        return { text: 'Connected', className: 'bg-green-100 text-green-800', icon: '✅' };
      case 'SCAN_QR_CODE':
        return { text: 'Scan QR Code', className: 'bg-yellow-100 text-yellow-800', icon: '📱' };
      case 'STARTING':
        return { text: 'Starting...', className: 'bg-blue-100 text-blue-800', icon: '⏳' };
      case 'STOPPED':
        return { text: 'Disconnected', className: 'bg-gray-100 text-gray-800', icon: '⭕' };
      case 'FAILED':
        return { text: 'Failed', className: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { text: 'Unknown', className: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  };

  const statusBadge = getStatusBadge();

  if (checking) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icons.whatsapp className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold">WhatsApp Connection</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Connection Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.className}`}>
            {statusBadge.icon} {statusBadge.text}
          </span>
        </div>

        {/* Connected State */}
        {status?.status === 'WORKING' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-green-900">WhatsApp is Connected!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your system is ready to send WhatsApp messages to members.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={stopSession} className="flex-1">
                <Icons.pause size={16} />
                Stop Session
              </Button>
              <Button variant="danger" onClick={logout} className="flex-1">
                <Icons.expired size={16} />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Disconnected State */}
        {(status?.status === 'STOPPED' || status?.status === 'FAILED') && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-yellow-900">WhatsApp Not Connected</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Start a session to enable WhatsApp notifications for your members.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startSession} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Starting...
                </>
              ) : (
                <>
                  <Icons.whatsapp size={16} />
                  Start WhatsApp Session
                </>
              )}
            </Button>
          </div>
        )}

        {/* QR Code Scanning State */}
        {status?.status === 'SCAN_QR_CODE' && (
          <div className="space-y-4">
              {qrCode ? (
              <div className="flex flex-col items-center space-y-3">
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 border-2 border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500">QR code refreshes automatically</p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
                <span className="ml-3 text-gray-600">Loading QR code...</span>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Open WhatsApp on your phone</li>
                <li>Go to <strong>Settings → Linked Devices</strong></li>
                <li>Tap <strong>"Link a Device"</strong></li>
                <li>Scan the QR code below</li>
              </ol>
            </div>
            
            
          </div>
        )}

        {/* Starting State */}
        {status?.status === 'STARTING' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <div>
                <p className="font-medium text-blue-900">Starting Session...</p>
                <p className="text-sm text-blue-700 mt-1">
                  Please wait while we initialize the WhatsApp connection.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
