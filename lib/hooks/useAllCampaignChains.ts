// STUB - replaced by M1 in Week 2. Do not change the exported signature.
'use client';

import { useState, useEffect } from 'react';
import type { CampaignChain } from '../types';
import { MOCK_CAMPAIGNS } from '../mock/campaigns';

export function useAllCampaignChains() {
  const [data, setData] = useState<CampaignChain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setData(MOCK_CAMPAIGNS.map((c) => c.chain));
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading, error };
}
