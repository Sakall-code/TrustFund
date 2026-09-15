'use client';

import { useState } from 'react';
import type { CampaignChain } from '@/lib/types';
import { useWallet } from '@/lib/hooks/useWallet';
import { useDonate } from '@/lib/hooks/useDonate';
import { maticToWei } from '@/lib/format';
import TxStatus from '@/components/campaign/TxStatus';

interface DonateBoxProps {
  campaignId: number;
  chain: CampaignChain | null;
}

/** Returns a validation error string, or null when valid. */
function validateAmount(raw: string): string | null {
  if (raw.trim() === '') return 'Enter an amount.';
  const num = Number(raw);
  if (isNaN(num) || num <= 0) return 'Amount must be greater than 0.';
  // Check decimal places (at most 6)
  const parts = raw.split('.');
  if (parts.length === 2 && parts[1].length > 6) return 'Maximum 6 decimal places.';
  return null;
}

export default function DonateBox({ campaignId, chain }: DonateBoxProps) {
  const { isConnected, connect } = useWallet();
  const { donate, isPending, isSuccess, txHash, error } = useDonate(campaignId);

  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Determine if campaign has ended
  const now = Math.floor(Date.now() / 1000);
  const hasEnded = chain ? chain.deadline < now : false;

  // ── Ended state ──────────────────────────────────────────────
  if (hasEnded) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-gray-400 font-medium">This campaign has ended</p>
      </div>
    );
  }

  // ── Not connected state ──────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-lg font-semibold text-white">Back this project</h3>
        <button
          onClick={connect}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          Connect wallet to donate
        </button>
      </div>
    );
  }

  // ── Connected / donate form ──────────────────────────────────
  const handleSubmit = async () => {
    const err = validateAmount(amount);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    const wei = maticToWei(amount);
    await donate(wei);
    // On success the hook sets isSuccess — clear the input
    setAmount('');
  };

  const quickPicks = [1, 5, 10] as const;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
      <h3 className="text-lg font-semibold text-white">Back this project</h3>

      {/* Amount input */}
      <div>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setValidationError(null);
            }}
            disabled={isPending}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
            MATIC
          </span>
        </div>
        {validationError && (
          <p className="text-red-400 text-xs mt-1.5">{validationError}</p>
        )}
      </div>

      {/* Quick-pick buttons */}
      <div className="flex gap-2">
        {quickPicks.map((v) => (
          <button
            key={v}
            onClick={() => { setAmount(String(v)); setValidationError(null); }}
            disabled={isPending}
            className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {v} MATIC
          </button>
        ))}
      </div>

      {/* Donate button */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
      >
        {isPending ? 'Processing…' : 'Donate'}
      </button>

      {/* Transaction feedback */}
      <TxStatus
        isPending={isPending}
        isSuccess={isSuccess}
        txHash={txHash}
        error={error}
      />
    </div>
  );
}
