'use client';

import { useSyncExternalStore } from 'react';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import { RPC_URL } from '../constants';

// ── Deterministic Hardhat Accounts ──────────────────────────────
export const PERSONAS = [
  {
    label: 'Alice (Creator)',
    emoji: '👩‍💼',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as `0x${string}`,
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`,
  },
  {
    label: 'Bob (Backer 1)',
    emoji: '👨‍🔧',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`,
    privateKey:
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as `0x${string}`,
  },
  {
    label: 'Charlie (Backer 2)',
    emoji: '🧑‍🎨',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as `0x${string}`,
    privateKey:
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' as `0x${string}`,
  },
] as const;

// ── Reactive Store (useSyncExternalStore) ───────────────────────
interface PersonaState {
  activeIndex: number;
  isConnected: boolean;
  timeOffset: number; // accumulated time-travel in seconds
}

let state: PersonaState = { activeIndex: 0, isConnected: true, timeOffset: 0 };
const listeners = new Set<() => void>();

// Hydrate from localStorage on the client
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('crowdfund_active_persona');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        typeof parsed.activeIndex === 'number' &&
        parsed.activeIndex >= 0 &&
        parsed.activeIndex < PERSONAS.length
      ) {
        state = {
          activeIndex: parsed.activeIndex,
          isConnected: parsed.isConnected !== false,
          timeOffset: typeof parsed.timeOffset === 'number' ? parsed.timeOffset : 0,
        };
      }
    }
  } catch {
    /* ignore corrupt localStorage */
  }
}

function emitChange() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('crowdfund_active_persona', JSON.stringify(state));
  }
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const SERVER_SNAPSHOT: PersonaState = Object.freeze({
  activeIndex: 0,
  isConnected: true,
  timeOffset: 0,
});

function getSnapshot(): PersonaState {
  return state;
}

function getServerSnapshot(): PersonaState {
  return SERVER_SNAPSHOT;
}

// ── Public API ──────────────────────────────────────────────────

export function setPersona(index: number) {
  if (index >= 0 && index < PERSONAS.length && index !== state.activeIndex) {
    state = { ...state, activeIndex: index, isConnected: true };
    emitChange();
  }
}

export function connectPersona() {
  if (!state.isConnected) {
    state = { ...state, isConnected: true };
    emitChange();
  }
}

export function disconnectPersona() {
  if (state.isConnected) {
    state = { ...state, isConnected: false };
    emitChange();
  }
}

export function addTimeOffset(seconds: number) {
  state = { ...state, timeOffset: (state.timeOffset || 0) + seconds };
  emitChange();
}

export function resetTimeOffset() {
  state = { ...state, timeOffset: 0 };
  emitChange();
}

export function getTimeOffset(): number {
  return state.timeOffset || 0;
}

/** React hook — triggers re-render when any persona state changes. */
export function usePersonaStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Get the currently active persona object (non-reactive, for use inside callbacks). */
export function getActivePersona() {
  return PERSONAS[state.activeIndex];
}

// ── Viem Clients ────────────────────────────────────────────────

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(RPC_URL),
});

/** Creates a fresh WalletClient keyed to the currently active persona. */
export function getActiveWalletClient() {
  const persona = PERSONAS[state.activeIndex];
  return createWalletClient({
    account: privateKeyToAccount(persona.privateKey),
    chain: hardhat,
    transport: http(RPC_URL),
  });
}
