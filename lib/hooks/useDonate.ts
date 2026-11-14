'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Abi } from 'viem';
import { CONTRACT_ADDRESS } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import {
  usePersonaStore,
  getActiveWalletClient,
  publicClient,
} from './_personas';
import { isContractConfigured, formatError } from './_errors';

export function useDonate(id: number) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = usePersonaStore();
  const queryClient = useQueryClient();

  const donate = useCallback(
    async (amountWei: string) => {
      setError(null);
      setIsSuccess(false);
      setTxHash(null);

      if (!isConnected) {
        setError('Please connect your wallet');
        return;
      }

      if (!isContractConfigured()) {
        setError('Contract address not configured');
        return;
      }

      setIsPending(true);
      try {
        const walletClient = getActiveWalletClient();
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CrowdfundABI as Abi,
          functionName: 'donate',
          args: [BigInt(id)],
          value: BigInt(amountWei),
        });

        setTxHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setIsSuccess(true);
        queryClient.invalidateQueries();
      } catch (err: unknown) {
        setError(formatError(err));
      } finally {
        setIsPending(false);
      }
    },
    [id, isConnected, queryClient]
  );

  return { donate, isPending, isSuccess, txHash, error };
}
