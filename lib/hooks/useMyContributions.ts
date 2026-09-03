import { Contribution, Address } from '../types';

export function useMyContributions(address: string | null) {
  const data: Contribution[] = address ? [
    {
      campaignId: 2,
      backer: address as Address,
      amountWei: "1000000000000000000",
      txHash: "0xabc",
      timestamp: Date.now() / 1000,
    }
  ] : [];
  return { data, isLoading: false, error: null };
}
