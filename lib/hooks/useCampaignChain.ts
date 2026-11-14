'use client';

import { useQuery } from '@tanstack/react-query';
import type { Abi } from 'viem';
import type { Address, CampaignChain } from '../types';
import { CONTRACT_ADDRESS } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import { publicClient, getTimeOffset } from './_personas';
import { formatError, ZERO_ADDRESS } from './_errors';

export function useCampaignChain(id: number) {
  const {
    data: rawData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['campaignChain', id, getTimeOffset()],
    queryFn: async () => {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CrowdfundABI as Abi,
        functionName: 'getCampaign',
        args: [BigInt(id)],
      });
      return result;
    },
    enabled: id > 0,
    refetchInterval: 4_000, // poll every 4 s for near-realtime updates
  });

  let data: CampaignChain | null = null;
  const error: string | null = formatError(queryError);

  if (rawData && !queryError) {
    const [owner, goal, deadline, raised, claimed] = rawData as [
      string,
      bigint,
      bigint,
      bigint,
      boolean,
      string,
    ];
    if (owner && owner.toLowerCase() !== ZERO_ADDRESS) {
      const offset = getTimeOffset();
      data = {
        campaignId: id,
        owner: owner as Address,
        goalWei: goal.toString(),
        deadline: Math.max(0, Number(deadline) - offset),
        raisedWei: raised.toString(),
        claimed,
      };
    }
  }

  return { data, isLoading, error };
}
