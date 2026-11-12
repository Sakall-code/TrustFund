'use client';

import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import type { Abi } from 'viem';
import type { Address, CampaignChain } from '../types';
import { CONTRACT_ADDRESS } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import { isContractConfigured, formatError, ZERO_ADDRESS } from './_errors';

export function useCampaignChain(id: number) {
  const configured = isContractConfigured();

  const {
    data: rawData,
    isLoading: isContractLoading,
    error: contractError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CrowdfundABI as Abi,
    functionName: 'getCampaign',
    args: [BigInt(id)],
    query: {
      enabled: configured && id > 0,
    },
  });

  const { data, error } = useMemo(() => {
    if (!configured) {
      return { data: null, error: 'Contract address not configured' };
    }
    if (contractError) {
      return { data: null, error: formatError(contractError) };
    }
    if (!rawData) {
      return { data: null, error: null };
    }

    const [owner, goal, deadline, raised, claimed] = rawData as [
      string,
      bigint,
      bigint,
      bigint,
      boolean,
      string
    ];

    // If the campaign does not exist, owner is address(0)
    if (!owner || owner.toLowerCase() === ZERO_ADDRESS) {
      return { data: null, error: null };
    }

    const campaign: CampaignChain = {
      campaignId: id,
      owner: owner as Address,
      goalWei: goal.toString(),
      deadline: Number(deadline),
      raisedWei: raised.toString(),
      claimed,
    };

    return { data: campaign, error: null };
  }, [configured, contractError, rawData, id]);

  const isLoading = configured && id > 0 ? isContractLoading : false;

  return { data, isLoading, error };
}
