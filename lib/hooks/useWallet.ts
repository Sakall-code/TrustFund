'use client';
import { useState } from 'react';
import { Address } from '../types';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);

  const connect = () => {
    setIsConnected(true);
    setAddress('0x1234567890abcdef1234567890abcdef12345678' as Address);
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  return { address, isConnected, connect, disconnect };
}
