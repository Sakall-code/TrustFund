export type Address = `0x${string}`;

export interface CampaignMeta {
  campaignId: number;
  title: string;
  description: string;
  tags: string[];
  imageCid: string;
  creatorAddress: Address;
  creatorName?: string;
  createdAt: string;
}

export interface CampaignChain {
  campaignId: number;
  owner: Address;
  goalWei: string;
  raisedWei: string;
  deadline: number;
  claimed: boolean;
}

export interface Campaign extends CampaignMeta {
  chain: CampaignChain;
}

export interface Contribution {
  campaignId: number;
  backer: Address;
  amountWei: string;
  txHash: string;
  timestamp: number;
}

export interface UserProfile {
  address: Address;
  displayName: string;
  bio: string;
}
