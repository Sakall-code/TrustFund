'use client';
import { useWallet } from '@/lib/hooks/useWallet';
import { CHAIN_ID, CHAIN_NAME } from '@/lib/constants';

interface ExtendedWallet {
  isConnected: boolean;
  chainId?: number;
  switchNetwork?: (chainId: number) => void;
}

export function NetworkBanner() {
  const wallet = useWallet() as unknown as ExtendedWallet;
  const { isConnected, chainId, switchNetwork } = wallet;

  const isWrongNetwork = Boolean(isConnected && chainId !== undefined && chainId !== CHAIN_ID);

  if (!isConnected || !isWrongNetwork) return null;

  return (
    <div className="w-full bg-amber-500/20 border-b border-amber-500/50 text-amber-200 px-4 py-2 flex items-center justify-between">
      <p className="text-sm">You are on the wrong network. Switch to {CHAIN_NAME}.</p>
      <button 
        onClick={() => switchNetwork?.(CHAIN_ID)}
        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md text-sm font-medium transition-colors"
      >
        Switch Network
      </button>
    </div>
  );
}
