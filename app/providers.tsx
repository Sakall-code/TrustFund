'use client';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // A mock providers wrapper, simulating RainbowKit + wagmi + React Query
  return <div className="mock-providers">{children}</div>;
}
