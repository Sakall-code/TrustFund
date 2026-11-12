'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import type { Address, Contribution } from '../types';
import { CONTRACT_ADDRESS, DEPLOY_BLOCK } from '../constants';
import { isContractConfigured, formatError } from './_errors';

const donatedEvent = parseAbiItem(
  'event Donated(uint256 indexed id, address indexed backer, uint256 amount)'
);

// Module-level cache for block timestamps to avoid duplicate getBlock RPC calls
const blockTimestampCache = new Map<string, number>();

export function useMyContributions(address: Address | null) {
  const [data, setData] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = usePublicClient();
  const configured = isContractConfigured();

  useEffect(() => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!configured) {
      setData([]);
      setIsLoading(false);
      setError('Contract address not configured');
      return;
    }

    if (!client) {
      return;
    }

    let isMounted = true;

    async function fetchContributions() {
      setIsLoading(true);
      setError(null);

      try {
        const latestBlock = await client!.getBlockNumber();
        const startBlock = DEPLOY_BLOCK > latestBlock ? latestBlock : DEPLOY_BLOCK;
        const CHUNK_SIZE = 10_000n;
        const allLogs = [];

        // Query logs in chunks from DEPLOY_BLOCK to latest
        for (let from = startBlock; from <= latestBlock; from += CHUNK_SIZE) {
          const to =
            from + CHUNK_SIZE - 1n > latestBlock ? latestBlock : from + CHUNK_SIZE - 1n;

          const chunkLogs = await client!.getLogs({
            address: CONTRACT_ADDRESS,
            event: donatedEvent,
            args: { backer: address as Address },
            fromBlock: from,
            toBlock: to,
          });

          allLogs.push(...chunkLogs);
        }

        if (!isMounted) return;

        const contributions: Contribution[] = [];
        for (const log of allLogs) {
          const blockNumber = log.blockNumber;
          let timestamp = Math.floor(Date.now() / 1000);

          if (blockNumber !== null) {
            const cacheKey = blockNumber.toString();
            if (blockTimestampCache.has(cacheKey)) {
              timestamp = blockTimestampCache.get(cacheKey)!;
            } else {
              const block = await client!.getBlock({ blockNumber });
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

        if (isMounted) {
          setData(contributions);
          setIsLoading(false);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setData([]);
          setIsLoading(false);
          setError(formatError(err));
        }
      }
    }

    fetchContributions();

    return () => {
      isMounted = false;
    };
  }, [address, client, configured]);

  return { data, isLoading, error };
}
