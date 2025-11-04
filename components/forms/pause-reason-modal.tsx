'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PauseReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export function PauseReasonModal({ isOpen, onClose, onConfirm, loading = false }: PauseReasonModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim() || 'No reason provided');
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pause Subscription"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Please provide a reason for pausing this subscription. This will help track pause history.
          </p>
          
          <Input
            label="Reason for Pause"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Medical leave, Travel, Personal reasons"
            disabled={loading}
            helperText="Optional - you can leave this blank"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="warning" loading={loading} disabled={loading}>
            Pause Subscription
          </Button>
        </div>
      </form>
    </Modal>
  );
}