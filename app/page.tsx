'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      // Add a small delay to let the animation play and prevent flickering
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }, 1500); // 1.5s splash screen duration

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, router, mounted]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-slate-100/40 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
        {/* Logo Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white p-4 rounded-2xl shadow-xl ring-1 ring-gray-900/5">
            <div className="w-32 h-32 relative overflow-hidden rounded-xl">
              <Image
                src="/assets/logo.jpeg"
                alt="BFC Logo"
                fill
                className="object-cover transform transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#F59E0B] drop-shadow-sm">
              BFC
            </span>{' '}
            Gym Management
          </h1>
          <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
            Powering Your Fitness Journey
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="h-1.5 w-48 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-progress origin-left w-full"></div>
          </div>
          <p className="text-xs text-gray-400 font-medium animate-pulse">
            Loading System...
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-xs text-gray-400 font-medium tracking-wider">
        SECURE • FAST • RELIABLE
      </div>
    </div>
  );
}
