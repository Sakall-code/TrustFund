'use client';

/**
 * SubmitProgress.tsx
 * A 3-step vertical checklist inside a Modal indicating submission progress:
 * 1. "Uploading image"
 * 2. "Confirm in your wallet"
 * 3. "Saving campaign details"
 *
 * Each step is styled according to its status:
 * - pending: neutral grey
 * - active: animated spinner
 * - done: green checkmark
 * - failed: red cross
 *
 * The modal cannot be dismissed while a step is actively running.
 */

import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export type SubmitStep = 0 | 1 | 2 | 3;

interface SubmitProgressProps {
  step: SubmitStep;
  error?: string | null;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, label: 'Uploading image' },
  { id: 2, label: 'Confirm in your wallet' },
  { id: 3, label: 'Saving campaign details' },
] as const;

export default function SubmitProgress({ step, error, onClose }: SubmitProgressProps) {
  const isOpen = step > 0;
  // The modal is "running" (cannot be dismissed) when a step is active and no error has occurred
  const isRunning = isOpen && !error;

  // Prevent closing when a step is actively in flight
  const handleModalClose = () => {
    if (!isRunning && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Creating Campaign"
      className="max-w-md"
    >
      <div className="space-y-6">
        <p className="text-sm text-neutral-400">
          Please wait while your campaign is published to IPFS and the blockchain.
        </p>

        {/* 3-item checklist */}
        <div className="space-y-4">
          {STEPS.map((s) => {
            let status: 'done' | 'active' | 'failed' | 'pending' = 'pending';

            if (error && step === s.id) {
              status = 'failed';
            } else if (step > s.id) {
              status = 'done';
            } else if (step === s.id) {
              status = 'active';
            } else {
              status = 'pending';
            }

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-800/40"
              >
                {/* Status icon */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  {status === 'done' && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                      ✓
                    </span>
                  )}
                  {status === 'active' && (
                    <Spinner size="sm" />
                  )}
                  {status === 'failed' && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
                      ✕
                    </span>
                  )}
                  {status === 'pending' && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-neutral-500 text-xs font-semibold">
                      {s.id}
                    </span>
                  )}
                </div>

                {/* Step label */}
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium ${
                      status === 'done'
                        ? 'text-neutral-200'
                        : status === 'active'
                        ? 'text-white'
                        : status === 'failed'
                        ? 'text-red-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message and close/retry button — only shown on failure */}
        {error && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-sm text-red-400">
              {error}
            </div>
            {onClose && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="w-full"
              >
                Close and Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
