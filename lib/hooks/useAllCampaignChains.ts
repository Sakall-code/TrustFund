'use client';

import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import type { Abi } from 'viem';
import type { Address, CampaignChain } from '../types';
import { CONTRACT_ADDRESS } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import { isContractConfigured, formatError, ZERO_ADDRESS } from './_errors';

export function useAllCampaignChains() {
  const configured = isContractConfigured();

  // Step 1: Read total number of campaigns
  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CrowdfundABI as Abi,
    functionName: 'campaignCount',
    query: {
      enabled: configured,
    },
  });

  const count = countData ? Number(countData) : 0;

  // Step 2: Prepare multicall contracts for every 1-based id from 1 to campaignCount
  const contracts = useMemo(() => {
    if (!configured || count <= 0) return [];
    const calls = [];
    for (let i = 1; i <= count; i++) {
      calls.push({
        address: CONTRACT_ADDRESS,
        abi: CrowdfundABI as Abi,
        functionName: 'getCampaign',
        args: [BigInt(i)],
      });
    }
    return calls;
  }, [configured, count]);

  // Step 3: Multicall all campaigns
  const {
    data: results,
    isLoading: isMulticallLoading,
    error: multicallError,
  } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  // Step 4: Map results to CampaignChain[]
  const { data, error } = useMemo(() => {
    if (!configured) {
      return { data: [], error: 'Contract address not configured' };
    }
    if (countError) {
      return { data: [], error: formatError(countError) };
    }
    if (multicallError) {
      return { data: [], error: formatError(multicallError) };
    }
    if (!results || results.length === 0) {
      return { data: [], error: null };
    }

    const campaigns: CampaignChain[] = [];
    results.forEach((res, index) => {
      const campaignId = index + 1; // 1-based ID convention in Crowdfund.sol
      if (res.status === 'success' && res.result) {
        const [owner, goal, deadline, raised, claimed] = res.result as [
          string,
          bigint,
          bigint,
          bigint,
          boolean,
          string
        ];
        if (owner && owner.toLowerCase() !== ZERO_ADDRESS) {
          campaigns.push({
            campaignId,
            owner: owner as Address,
            goalWei: goal.toString(),
            deadline: Number(deadline),
            raisedWei: raised.toString(),
            claimed,
          });
        }
      }
    });

    return { data: campaigns, error: null };
  }, [configured, countError, multicallError, results]);

  const isLoading = configured
    ? isCountLoading || (count > 0 && isMulticallLoading)
    : false;

  return { data, isLoading, error };
}
