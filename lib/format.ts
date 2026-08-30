import { formatUnits, parseUnits } from 'viem';
import { IPFS_GATEWAY } from './constants';

export function weiToMatic(wei: string): string {
  return formatUnits(BigInt(wei), 18);
}

export function maticToWei(matic: string): string {
  return parseUnits(matic, 18).toString();
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function daysLeft(deadline: number): number {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;
  return diff > 0 ? Math.ceil(diff / 86400) : 0;
}

export function percentFunded(raisedWei: string, goalWei: string): number {
  const raised = BigInt(raisedWei);
  const goal = BigInt(goalWei);
  if (goal === 0n) return 0;
  return Number((raised * 100n) / goal);
}

export function ipfsUrl(cid: string): string {
  return `${IPFS_GATEWAY}${cid}`;
}
