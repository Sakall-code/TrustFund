import { CampaignMeta, Address, UserProfile, Contribution } from './types';

export async function listCampaigns(params?: { q?: string; tag?: string; page?: number }) {
  const items: CampaignMeta[] = [
    {
      campaignId: 1,
      title: "My Awesome Project",
      description: "Building the next big thing.",
      tags: ["tech"],
      imageCid: "QmTest",
      creatorAddress: "0x1234567890abcdef1234567890abcdef12345678" as Address,
      createdAt: new Date().toISOString()
    },
    {
      campaignId: 2,
      title: "Another Project",
      description: "Building something else.",
      tags: ["art"],
      imageCid: "QmTest2",
      creatorAddress: "0x9994567890abcdef1234567890abcdef12345678" as Address,
      createdAt: new Date().toISOString()
    }
  ];
  return { items, total: items.length };
}

export async function getCampaignMeta(campaignId: number): Promise<CampaignMeta | null> { return null; }
export async function createCampaignMeta(input: Omit<CampaignMeta,'createdAt'>): Promise<CampaignMeta> { return input as any; }
export async function uploadImage(file: File): Promise<{ cid: string }> { return { cid: 'Qm' }; }
export async function getUser(address: Address): Promise<UserProfile | null> { return null; }
export async function upsertUser(input: UserProfile): Promise<UserProfile> { return input; }
export async function getContributions(campaignId: number): Promise<Contribution[]> { return []; }
