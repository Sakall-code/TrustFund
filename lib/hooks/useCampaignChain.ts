// STUB - replaced by M1 in Week 2. Do not change the exported signature.
'use client';

import { useState, useEffect } from 'react';
import type { CampaignChain } from '../types';
import { MOCK_CAMPAIGNS } from '../mock/campaigns';

export function useCampaignChain(id: number) {
  const [data, setData] = useState<CampaignChain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const campaign = MOCK_CAMPAIGNS.find((c) => c.campaignId === id);
      if (campaign) {
        setData(campaign.chain);
      } else {
        setError(new Error('Campaign not found'));
      }
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  return { data, isLoading, error };
}
