'use client';

import { useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import type { Address } from '../types';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const connect = useCallback(async () => {
    openConnectModal?.();
  }, [openConnectModal]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    address: (address as Address) ?? null,
    isConnected,
    connect,
    disconnect: handleDisconnect,
  };
}
