'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEventLogs, type Abi } from 'viem';
import { CONTRACT_ADDRESS, CHAIN_ID } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import { isContractConfigured, formatError } from './_errors';

export function useCreateCampaign() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();
  const client = usePublicClient();

  const {
    writeContractAsync,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  const create = useCallback(
    async (goalWei: string, deadline: number | string, cid: string) => {
      setActionError(null);
      reset();

      if (!isConnected) {
        setActionError('Please connect your wallet');
        return null;
      }

      if (!isContractConfigured()) {
        setActionError('Contract address not configured');
        return null;
      }

      if (chainId !== CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: CHAIN_ID });
        } catch {
          setActionError('Please switch to Polygon Amoy');
          return null;
        }
      }

      setIsActionPending(true);
      try {
        const txHash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CrowdfundABI as Abi,
          functionName: 'createCampaign',
          args: [BigInt(goalWei), BigInt(deadline), cid],
        });

        let campaignId: number | null = null;
        if (client && txHash) {
          const receipt = await client.waitForTransactionReceipt({ hash: txHash });
          const logs = parseEventLogs({
            abi: CrowdfundABI as Abi,
            eventName: 'CampaignCreated',
            logs: receipt.logs,
          });

          if (logs.length > 0 && logs[0].args && 'id' in logs[0].args) {
            campaignId = Number((logs[0].args as { id: bigint }).id);
          } else {
            const count = await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CrowdfundABI as Abi,
              functionName: 'campaignCount',
            });
            campaignId = Number(count);
          }
        }

        return { hash: txHash, campaignId };
      } catch (err: unknown) {
        setActionError(formatError(err));
        return null;
      } finally {
        setIsActionPending(false);
      }
    },
    [isConnected, chainId, switchChainAsync, writeContractAsync, reset, client]
  );

  const isPending = isActionPending || isWritePending || isConfirming;
  const txHash = hash ?? null;
  const error = actionError || formatError(writeError) || formatError(receiptError);

  return { create, isPending, isSuccess, txHash, error };
}
