'use client';

import { useQuery } from '@tanstack/react-query';
import type { Abi } from 'viem';
import type { Address, CampaignChain } from '../types';
import { CONTRACT_ADDRESS } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import { publicClient, getTimeOffset } from './_personas';
import { formatError, ZERO_ADDRESS } from './_errors';

export function useAllCampaignChains() {
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['allCampaignChains', getTimeOffset()],
    queryFn: async () => {
      const count = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CrowdfundABI as Abi,
        functionName: 'campaignCount',
      })) as bigint;

      const n = Number(count);
      if (n === 0) return [];

      // Fetch all campaigns in parallel (1-based IDs)
      const results = await Promise.all(
        Array.from({ length: n }, (_, i) =>
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CrowdfundABI as Abi,
            functionName: 'getCampaign',
            args: [BigInt(i + 1)],
          })
        )
      );

      const offset = getTimeOffset();
      const campaigns: CampaignChain[] = [];
      results.forEach((result, index) => {
        const [owner, goal, deadline, raised, claimed] = result as [
          string,
          bigint,
          bigint,
          bigint,
          boolean,
          string,
        ];
        if (owner && owner.toLowerCase() !== ZERO_ADDRESS) {
          campaigns.push({
            campaignId: index + 1,
            owner: owner as Address,
            goalWei: goal.toString(),
            deadline: Math.max(0, Number(deadline) - offset),
            raisedWei: raised.toString(),
            claimed,
          });
        }
      });

      return campaigns;
    },
    refetchInterval: 4_000,
  });

  return { data: data ?? [], isLoading, error: formatError(queryError) };
}
