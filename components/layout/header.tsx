'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function Header({ title = 'Gym Management', onMenuToggle }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <span>👤</span>
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}