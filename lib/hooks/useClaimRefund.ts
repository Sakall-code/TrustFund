'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import type { Abi } from 'viem';
import { CONTRACT_ADDRESS, CHAIN_ID } from '../constants';
import CrowdfundABI from '../abi/Crowdfund.json';
import { isContractConfigured, formatError } from './_errors';

export function useClaimRefund(id: number) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();

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

  const claimRefund = useCallback(async () => {
    setActionError(null);
    reset();

    if (!isConnected) {
      setActionError('Please connect your wallet');
      return;
    }

    if (!isContractConfigured()) {
      setActionError('Contract address not configured');
      return;
    }

    if (chainId !== CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: CHAIN_ID });
      } catch {
        setActionError('Please switch to Polygon Amoy');
        return;
      }
    }

    setIsActionPending(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CrowdfundABI as Abi,
        functionName: 'claimRefund',
        args: [BigInt(id)],
      });
    } catch (err: unknown) {
      setActionError(formatError(err));
    } finally {
      setIsActionPending(false);
    }
  }, [id, isConnected, chainId, switchChainAsync, writeContractAsync, reset]);

  const isPending = isActionPending || isWritePending || isConfirming;
  const txHash = hash ?? null;
  const error = actionError || formatError(writeError) || formatError(receiptError);

  return { claimRefund, isPending, isSuccess, txHash, error };
}
