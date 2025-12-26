'use client';

import React, { createContext, useContext, useState } from 'react';
import { whatsappApi } from '@/lib/api';

interface WhatsAppContextType {
  isConnected: boolean;
  isLoading: boolean;
  refreshStatus: () => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const data = await whatsappApi.getStatus();
      setIsConnected(data.status === 'ACTIVE');
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhatsAppContext.Provider value={{ isConnected, isLoading, refreshStatus: checkStatus }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsAppStatus() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsAppStatus must be used within WhatsAppProvider');
  }
  return context;
}
