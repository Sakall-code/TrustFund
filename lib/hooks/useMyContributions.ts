'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAbiItem } from 'viem';
import type { Address, Contribution } from '../types';
import { CONTRACT_ADDRESS, DEPLOY_BLOCK } from '../constants';
import { publicClient } from './_personas';
import { isContractConfigured, formatError } from './_errors';

const donatedEvent = parseAbiItem(
  'event Donated(uint256 indexed id, address indexed backer, uint256 amount)'
);

// Module-level cache for block timestamps
const blockTimestampCache = new Map<string, number>();

export function useMyContributions(address: Address | null) {
  const configured = isContractConfigured();

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['myContributions', address],
    queryFn: async () => {
      if (!address) return [];

      const latestBlock = await publicClient.getBlockNumber();
      const startBlock =
        DEPLOY_BLOCK > latestBlock ? latestBlock : DEPLOY_BLOCK;

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: donatedEvent,
        args: { backer: address as Address },
        fromBlock: startBlock,
        toBlock: latestBlock,
      });

      const contributions: Contribution[] = [];
      for (const log of logs) {
        let timestamp = Math.floor(Date.now() / 1000);
        const blockNumber = log.blockNumber;

        if (blockNumber !== null) {
          const cacheKey = blockNumber.toString();
          if (blockTimestampCache.has(cacheKey)) {
            timestamp = blockTimestampCache.get(cacheKey)!;
          } else {
            const block = await publicClient.getBlock({ blockNumber });
            timestamp = Number(block.timestamp);
            blockTimestampCache.set(cacheKey, timestamp);
          }
        }

        contributions.push({
          campaignId: Number(log.args.id),
          backer: (log.args.backer as Address) || address,
          amountWei: log.args.amount ? log.args.amount.toString() : '0',
          txHash: log.transactionHash,
          timestamp,
        });
      }

      return contributions;
    },
    enabled: !!address && configured,
    refetchInterval: 4_000,
  });

  return { data: data ?? [], isLoading, error: formatError(queryError) };
}
