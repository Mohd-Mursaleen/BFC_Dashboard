'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
interface NavigationProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export function Navigation({ isMobile = false, onItemClick }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/members', label: 'Members', icon: '👥' },
    { href: '/plans', label: 'Plans', icon: '📋' },
    { href: '/subscriptions', label: 'Subscriptions', icon: '📝' },
    { href: '/whatsapp-broadcast', label: 'WhatsApp Broadcast', icon: '📱' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/scheduler', label: 'Scheduler', icon: '⚙️' },
  ];

  const isActive = (href: string) => pathname === href;

  if (isMobile) {
    // Bottom navigation for mobile
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  // Desktop sidebar navigation
  return (
    <nav className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:bg-gray-900">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <Image src="/assets/logo.jpeg" alt="Gym Manager Logo" className="h-8 w-8" width={32} height={32} />
        <span className="ml-2 text-white font-semibold">Bengaluru Fitness Club</span>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </nav>
  );
}