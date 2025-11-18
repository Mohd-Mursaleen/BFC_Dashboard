'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Icons } from '@/lib/icons';

interface NavigationProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export function Navigation({ isMobile = false, onItemClick }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', Icon: Icons.dashboard },
    { href: '/members', label: 'Members', Icon: Icons.members },
    { href: '/plans', label: 'Plans', Icon: Icons.plans },
    { href: '/subscriptions', label: 'Subscriptions', Icon: Icons.subscriptions },
    { href: '/whatsapp-broadcast', label: 'WhatsApp Broadcast', Icon: Icons.whatsapp },
    { href: '/scheduler', label: 'Scheduler', Icon: Icons.scheduler },
  ];

  const isActive = (href: string) => pathname === href;

  if (isMobile) {
    // Bottom navigation for mobile
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const IconComponent = item.Icon;
            return (
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
                <IconComponent size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop sidebar navigation
  return (
    <nav className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-slate-900">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-20 flex-shrink-0 px-6 bg-slate-900 border-b border-slate-800">
          <Image src="/assets/logo.jpeg" alt="Gym Manager Logo" className="h-10 w-10 rounded-xl" width={40} height={40} />
          <span className="ml-3 text-white font-bold text-lg">BFC</span>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-6 space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <IconComponent className="mr-3" size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </nav>
  );
}