'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-slate-100/40 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          {/* Logo */}
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white p-3 rounded-2xl shadow-lg ring-1 ring-gray-900/5">
              <div className="w-20 h-20 relative overflow-hidden rounded-xl">
                <Image
                  src="/assets/logo.jpeg"
                  alt="BFC Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#F59E0B] drop-shadow-sm">
                BFC
              </span>{' '}
              Gym Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your dashboard</p>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <span className="text-sm text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
                className="bg-white/50"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="bg-white/50"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                loading={loading}
                disabled={!username || !password}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 mb-2">Default credentials:</div>
              <div className="inline-block bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-mono text-gray-600">
                admin / password123
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium tracking-wider">
          SECURE • FAST • RELIABLE
        </div>
      </div>
    </div>
  );
}