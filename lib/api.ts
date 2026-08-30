import type { CampaignMeta, Campaign, Contribution, UserProfile, Address } from './types';
import { MOCK_CAMPAIGNS, MOCK_CONTRIBUTIONS } from './mock/campaigns';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listCampaigns(): Promise<Campaign[]> {
  await delay(400);
  return MOCK_CAMPAIGNS;
}

export async function getCampaignMeta(id: number): Promise<CampaignMeta | null> {
  await delay(400);
  return MOCK_CAMPAIGNS.find((c) => c.campaignId === id) ?? null;
}

export async function createCampaignMeta(
  data: Omit<CampaignMeta, 'campaignId' | 'createdAt'>
): Promise<CampaignMeta> {
  await delay(400);
  return {
    ...data,
    campaignId: MOCK_CAMPAIGNS.length + 1,
    createdAt: new Date().toISOString(),
  };
}

export async function uploadImage(_file: File): Promise<string> {
  await delay(400);
  return 'QmPlaceholderImageCid123456789';
}

export async function getUser(address: Address): Promise<UserProfile | null> {
  await delay(400);
  return {
    address,
    displayName: 'Mock User',
    bio: 'This is a mock user profile.',
  };
}

export async function upsertUser(profile: UserProfile): Promise<UserProfile> {
  await delay(400);
  return profile;
}

export async function getContributions(campaignId: number): Promise<Contribution[]> {
  await delay(400);
  return MOCK_CONTRIBUTIONS.filter((c) => c.campaignId === campaignId);
}
