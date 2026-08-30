// STUB - replaced by M1 in Week 2. Do not change the exported signature.
'use client';

import { useState, useCallback } from 'react';
import type { Address } from '../types';

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setAddress('0x1234567890abcdef1234567890abcdef12345678' as Address);
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
  }, []);

  return { address, isConnected, connect, disconnect };
}
