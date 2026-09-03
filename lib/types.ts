export type Address = `0x${string}`;

export interface CampaignMeta {          // off-chain, from MongoDB
  campaignId: number;
  title: string;
  description: string;
  tags: string[];
  imageCid: string;                      // IPFS hash
  creatorAddress: Address;
  creatorName?: string;
  createdAt: string;                     // ISO date string
}

export interface CampaignChain {         // on-chain, from the smart contract
  campaignId: number;
  owner: Address;
  goalWei: string;
  raisedWei: string;
  deadline: number;                      // unix seconds
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
