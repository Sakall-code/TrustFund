'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { parseEventLogs, type Abi } from 'viem';
import { CONTRACT_ADDRESS } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import {
  usePersonaStore,
  getActiveWalletClient,
  publicClient,
} from './_personas';
import { isContractConfigured, formatError } from './_errors';

export function useCreateCampaign() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = usePersonaStore();
  const queryClient = useQueryClient();

  const create = useCallback(
    async (goalWei: string, deadline: number | string, cid: string) => {
      setError(null);
      setIsSuccess(false);
      setTxHash(null);

      if (!isConnected) {
        setError('Please connect your wallet');
        return null;
      }

      if (!isContractConfigured()) {
        setError('Contract address not configured');
        return null;
      }

      setIsPending(true);
      try {
        const walletClient = getActiveWalletClient();

        // Check current on-chain timestamp
        const block = await publicClient.getBlock();
        const chainNow = block.timestamp;
        let finalDeadline = BigInt(deadline);

        // If chain time has been advanced (via time-travel) ahead of the date picked by the UI,
        // calculate the intended duration from wall-clock now and anchor it to chainNow
        // so the smart contract's deadline check (deadline > block.timestamp + 1 hours) never fails:
        if (finalDeadline <= chainNow + 3600n) {
          const wallNow = BigInt(Math.floor(Date.now() / 1000));
          const duration = finalDeadline > wallNow ? finalDeadline - wallNow : 7n * 86400n;
          finalDeadline = chainNow + (duration > 3600n ? duration : 7200n);
        }

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CrowdfundABI as Abi,
          functionName: 'createCampaign',
          args: [BigInt(goalWei), finalDeadline, cid],
        });

        setTxHash(hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const logs = parseEventLogs({
          abi: CrowdfundABI as Abi,
          eventName: 'CampaignCreated',
          logs: receipt.logs,
        });

        let campaignId: number | null = null;
        if (logs.length > 0 && logs[0].args && 'id' in logs[0].args) {
          campaignId = Number((logs[0].args as { id: bigint }).id);
        } else {
          const count = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CrowdfundABI as Abi,
            functionName: 'campaignCount',
          });
          campaignId = Number(count);
        }

        setIsSuccess(true);
        queryClient.invalidateQueries();
        return { hash, campaignId };
      } catch (err: unknown) {
        setError(formatError(err));
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [isConnected, queryClient]
  );

  return { create, isPending, isSuccess, txHash, error };
}
