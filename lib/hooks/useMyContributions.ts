// STUB - replaced by M1 in Week 2. Do not change the exported signature.
'use client';

import { useState, useEffect } from 'react';
import type { Address, Contribution } from '../types';
import { MOCK_CONTRIBUTIONS } from '../mock/campaigns';

export function useMyContributions(address: Address | null) {
  const [data, setData] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      setData(MOCK_CONTRIBUTIONS.filter((c) => c.backer === address));
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [address]);

  return { data, isLoading, error };
}
