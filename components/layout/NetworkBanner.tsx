'use client';
import { useWallet } from '@/lib/hooks/useWallet';
import { CHAIN_NAME } from '@/lib/constants';

export function NetworkBanner() {
  const { isConnected } = useWallet();
  // Mocking network check. Assuming it's correct for now.
  const isWrongNetwork = false;

  if (!isConnected || !isWrongNetwork) return null;

  return (
    <div className="w-full bg-amber-500/20 border-b border-amber-500/50 text-amber-200 px-4 py-2 flex items-center justify-between">
      <p className="text-sm">You are on the wrong network. Switch to {CHAIN_NAME}.</p>
      <button className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md text-sm font-medium transition-colors">
        Switch Network
      </button>
    </div>
  );
}
