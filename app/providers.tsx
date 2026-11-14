'use client';

import { WagmiProvider } from 'wagmi';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { formatEther } from 'viem';
import { config } from '@/lib/wagmi';
import { RPC_URL, CHAIN_ID } from '@/lib/constants';
import {
  PERSONAS,
  usePersonaStore,
  setPersona,
  connectPersona,
  disconnectPersona,
  addTimeOffset,
  resetTimeOffset,
  publicClient,
} from '@/lib/hooks/_personas';

const LOCAL_RPC = CHAIN_ID === 31337 ? 'http://127.0.0.1:8545' : RPC_URL;

// ── DevToolbar ──────────────────────────────────────────────────
function DevToolbar() {
  const { activeIndex, isConnected, timeOffset } = usePersonaStore();
  const queryClient = useQueryClient();
  const [balances, setBalances] = useState<string[]>(['—', '—', '—']);
  const [chainTime, setChainTime] = useState<string>('—');
  const [collapsed, setCollapsed] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const bals = await Promise.all(
        PERSONAS.map((p) => publicClient.getBalance({ address: p.address }))
      );
      setBalances(bals.map((b) => parseFloat(formatEther(b)).toFixed(2)));

      const block = await publicClient.getBlock();
      const date = new Date(Number(block.timestamp) * 1000);
      setChainTime(date.toLocaleString());
    } catch {
      setBalances(['err', 'err', 'err']);
      setChainTime('Node offline');
    }
  }, []);

  useEffect(() => {
    refreshData();
    const id = setInterval(refreshData, 4000);
    return () => clearInterval(id);
  }, [refreshData]);

  const timeTravel = useCallback(
    async (seconds: number) => {
      try {
        await fetch(LOCAL_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [seconds],
            id: 1,
          }),
        });
        await fetch(LOCAL_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: 2,
          }),
        });
        addTimeOffset(seconds);
        queryClient.invalidateQueries();
        await refreshData();
      } catch (e) {
        console.error('Time travel failed:', e);
      }
    },
    [queryClient, refreshData]
  );

  const handleResetTime = useCallback(() => {
    resetTimeOffset();
    queryClient.invalidateQueries();
  }, [queryClient]);

  // ── Collapsed state: small floating button ──
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-600 bg-zinc-800 text-lg shadow-lg transition-colors hover:bg-zinc-700 cursor-pointer"
        title="Open Dev Toolbar"
      >
        🛠️
      </button>
    );
  }

  const offsetHours = Math.round(timeOffset / 3600);
  const offsetDays = Math.floor(timeOffset / 86400);

  // ── Expanded toolbar ──
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 font-mono text-sm text-zinc-200 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          ⛓ Dev Toolbar
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-lg leading-none text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Persona Switcher */}
      <div className="mb-3 space-y-1.5">
        {PERSONAS.map((p, i) => (
          <button
            key={i}
            onClick={() => setPersona(i)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-all cursor-pointer ${
              i === activeIndex && isConnected
                ? 'border border-emerald-500/50 bg-emerald-900/50 text-emerald-300'
                : 'border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-700'
            }`}
          >
            <span className="text-lg">{p.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{p.label}</div>
              <div className="truncate text-[10px] text-zinc-500">
                {p.address.slice(0, 6)}…{p.address.slice(-4)}
              </div>
            </div>
            <span className="whitespace-nowrap text-xs text-amber-400 font-bold">
              {balances[i]} ETH
            </span>
          </button>
        ))}
      </div>

      {/* Connection Toggle */}
      <div className="mb-3">
        <button
          onClick={() => (isConnected ? disconnectPersona() : connectPersona())}
          className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            isConnected
              ? 'border border-red-500/40 bg-red-900/40 text-red-400 hover:bg-red-900/60'
              : 'border border-emerald-500/40 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60'
          }`}
        >
          {isConnected ? '🔌 Disconnect' : '🔗 Connect'}
        </button>
      </div>

      {/* Time Travel */}
      <div className="border-t border-zinc-700 pt-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-500">
          <span>⏰ Time Travel</span>
          {timeOffset > 0 && (
            <span className="text-amber-400 font-semibold">
              +{offsetDays > 0 ? `${offsetDays}d ` : ''}{offsetHours % 24}h jumped
            </span>
          )}
        </div>
        <div className="mb-2 flex gap-2">
          <button
            onClick={() => timeTravel(7200)}
            className="flex-1 rounded-lg border border-indigo-500/30 bg-indigo-900/40 px-2 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-900/60 cursor-pointer text-center"
          >
            +2 Hours
          </button>
          <button
            onClick={() => timeTravel(604800)}
            className="flex-1 rounded-lg border border-indigo-500/30 bg-indigo-900/40 px-2 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-900/60 cursor-pointer text-center"
          >
            +7 Days
          </button>
          {timeOffset > 0 && (
            <button
              onClick={handleResetTime}
              title="Reset UI time offset"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              ↺ Reset
            </button>
          )}
        </div>
        <div className="text-[10px] text-zinc-500">
          Chain time: <span className="text-zinc-300">{chainTime}</span>
        </div>
      </div>
    </div>
  );
}

// ── Providers ───────────────────────────────────────────────────
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <DevToolbar />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { Providers };
