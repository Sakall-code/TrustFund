'use client';

/**
 * SuccessScreen.tsx
 * Displayed after successful campaign creation:
 * - Big green tick & "Your campaign is live!"
 * - Warning notice if metadata saving failed (while transaction succeeded on-chain)
 * - "View campaign" link button to `/campaign/${campaignId}`
 * - "View transaction" link to EXPLORER_URL
 * - "Create another" button to reset the form state
 */

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { EXPLORER_URL } from '@/lib/constants';

interface SuccessScreenProps {
  campaignId: number;
  txHash?: string;
  warning?: string | null;
  onReset: () => void;
}

export default function SuccessScreen({
  campaignId,
  txHash,
  warning,
  onReset,
}: SuccessScreenProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 sm:p-10 shadow-xl text-center space-y-6">
      {/* Big green tick */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-4xl shadow-inner">
        ✓
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Your campaign is live!
        </h2>
        <p className="text-sm text-neutral-400">
          Campaign #{campaignId} has been successfully published to the blockchain.
        </p>
      </div>

      {/* Warning banner — shown when Step 3 (metadata) failed after on-chain success */}
      {warning && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300 text-left">
          <p className="font-semibold mb-1">⚠️ Notice</p>
          <p>{warning}</p>
        </div>
      )}

      {/* Action links */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href={`/campaign/${campaignId}`} className="w-full sm:w-auto">
          <Button size="lg" variant="primary" className="w-full sm:w-auto">
            View campaign
          </Button>
        </Link>

        {txHash && (
          <a
            href={`${EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              View transaction ↗
            </Button>
          </a>
        )}
      </div>

      {/* Create another button */}
      <div className="pt-4 border-t border-neutral-800">
        <Button
          type="button"
          size="md"
          variant="ghost"
          onClick={onReset}
          className="text-neutral-400 hover:text-white"
        >
          + Create another campaign
        </Button>
      </div>
    </div>
  );
}
