'use client';

import type { Address } from '../types';
import {
  usePersonaStore,
  connectPersona,
  disconnectPersona,
  PERSONAS,
} from './_personas';

export function useWallet() {
  const { activeIndex, isConnected } = usePersonaStore();
  const persona = PERSONAS[activeIndex];

  return {
    address: isConnected ? (persona.address as Address) : null,
    isConnected,
    connect: connectPersona,
    disconnect: disconnectPersona,
  };
}
