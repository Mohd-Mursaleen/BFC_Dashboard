'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EnhancedPauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; days?: number }) => void;
  loading?: boolean;
  maxPauseDays?: number;
}

export function EnhancedPauseModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false,
  maxPauseDays = 15 
}: EnhancedPauseModalProps) {
  const [reason, setReason] = useState('');
  const [useSpecificDays, setUseSpecificDays] = useState(false);
  const [pauseDays, setPauseDays] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      reason: reason.trim() || 'No reason provided',
      ...(useSpecificDays && { days: pauseDays })
    };
    onConfirm(data);
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setUseSpecificDays(false);
      setPauseDays(7);
      onClose();
    }
  };

  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pause Subscription"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Configure how you want to pause this subscription. You can pause indefinitely or for a specific number of days.
          </p>
          
          <Input
            label="Reason for Pause"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Going on vacation, Medical leave, Travel"
            disabled={loading}
            helperText="Optional - you can leave this blank"
          />
        </div>

        {/* Toggle for specific days */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="useSpecificDays"
              checked={useSpecificDays}
              onChange={(e) => setUseSpecificDays(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useSpecificDays" className="text-sm font-medium text-gray-700">
              Pause for specific number of days
            </label>
          </div>

          {useSpecificDays && (
            <div className="ml-7 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of days to pause: {pauseDays} day{pauseDays !== 1 ? 's' : ''}
                </label>
                
                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max={maxPauseDays}
                    value={pauseDays}
                    onChange={(e) => setPauseDays(parseInt(e.target.value))}
                    disabled={loading}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(pauseDays / maxPauseDays) * 100}%, #e5e7eb ${(pauseDays / maxPauseDays) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 day</span>
                    <span>{maxPauseDays} days (max)</span>
                  </div>
                </div>

                {/* Resume date preview */}
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Will resume on:</span>
                    <span className="font-medium text-blue-600">
                      {formatDate(pauseDays)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!useSpecificDays && (
            <div className="ml-7 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Indefinite pause:</strong> The subscription will remain paused until manually resumed.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="warning" loading={loading} disabled={loading}>
            {useSpecificDays ? `Pause for ${pauseDays} day${pauseDays !== 1 ? 's' : ''}` : 'Pause Subscription'}
          </Button>
        </div>
      </form>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </Modal>
  );
}