import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContributionCacheModel from '@/models/ContributionCache';
import { createPublicClient, http, parseAbiItem, defineChain } from 'viem';
import { CONTRACT_ADDRESS, RPC_URL } from '@/lib/constants';
import type { Address, Contribution } from '@/lib/types';

const hardhatChain = defineChain({
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const donatedEvent = parseAbiItem(
  'event Donated(uint256 indexed id, address indexed backer, uint256 amount)'
);

/**
 * GET /api/campaigns/[id]/contributions
 * Returns all contributions for a specific campaign, querying on-chain events
 * and syncing with the database cache.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id, 10);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // 1. Try DB cache first
    let cachedContributions: Contribution[] = [];
    try {
      await dbConnect();
      cachedContributions = (await ContributionCacheModel.find({ campaignId })
        .sort({ timestamp: -1 })
        .lean()) as unknown as Contribution[];
    } catch {
      // ignore DB read errors and fall back to on-chain
    }

    if (cachedContributions && cachedContributions.length > 0) {
      return NextResponse.json(cachedContributions);
    }

    // 2. Query the blockchain's Donated event logs directly
    try {
      const client = createPublicClient({
        chain: hardhatChain,
        transport: http(RPC_URL),
      });

      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: donatedEvent,
        args: { id: BigInt(campaignId) },
        fromBlock: 0n,
        toBlock: 'latest',
      });

      const contributions: Contribution[] = [];
      for (const log of logs) {
        const block = await client.getBlock({ blockNumber: log.blockNumber });
        contributions.push({
          campaignId,
          backer: (log.args.backer as Address) || '0x0000000000000000000000000000000000000000',
          amountWei: log.args.amount ? log.args.amount.toString() : '0',
          txHash: log.transactionHash,
          timestamp: Number(block.timestamp),
        });
      }

      // Sort newest first
      contributions.sort((a, b) => b.timestamp - a.timestamp);

      // Best-effort async cache into DB
      if (contributions.length > 0) {
        ContributionCacheModel.insertMany(
          contributions.map((c) => ({
            campaignId: c.campaignId,
            backer: c.backer,
            amountWei: c.amountWei,
            txHash: c.txHash,
            timestamp: c.timestamp,
          })),
          { ordered: false }
        ).catch(() => {});
      }

      return NextResponse.json(contributions);
    } catch (chainErr) {
      console.error('Failed to query on-chain contributions:', chainErr);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('GET /api/campaigns/[id]/contributions error:', error);
    return NextResponse.json([]);
  }
}
