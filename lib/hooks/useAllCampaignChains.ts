import { CampaignChain, Address } from '../types';

export function useAllCampaignChains() {
  const data: CampaignChain[] = [
    {
      campaignId: 1,
      owner: "0x1234567890abcdef1234567890abcdef12345678" as Address,
      goalWei: "1000000000000000000",
      raisedWei: "500000000000000000",
      deadline: Math.floor(Date.now() / 1000) + 86400,
      claimed: false,
    },
    {
      campaignId: 2,
      owner: "0x9994567890abcdef1234567890abcdef12345678" as Address,
      goalWei: "2000000000000000000",
      raisedWei: "2000000000000000000",
      deadline: Math.floor(Date.now() / 1000) - 86400,
      claimed: false,
    }
  ];
  return { data, isLoading: false, error: null };
}
