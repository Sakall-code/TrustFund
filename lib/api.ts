import type { CampaignMeta, Contribution, UserProfile, Address } from './types';

/**
 * Client-side API functions.
 *
 * Signatures match Section 1.8 — FROZEN. Do not change function names,
 * parameter types, or return types. Only the bodies are replaced.
 */

const TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after 10 seconds.`);
    }
    throw new Error(`Network error: Could not reach ${url}.`);
  } finally {
    clearTimeout(id);
  }
}

export async function listCampaigns(
  params?: { q?: string; tag?: string; page?: number }
): Promise<{ items: CampaignMeta[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.page) query.set('page', String(params.page));

  const qs = query.toString();
  const res = await fetchWithTimeout(`/api/campaigns${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

export async function getCampaignMeta(campaignId: number): Promise<CampaignMeta | null> {
  const res = await fetchWithTimeout(`/api/campaigns/${campaignId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch campaign');
  return res.json();
}

export async function createCampaignMeta(
  input: Omit<CampaignMeta, 'createdAt'>
): Promise<CampaignMeta> {
  const res = await fetchWithTimeout('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 409) throw new Error('Campaign ID already exists');
  if (!res.ok) throw new Error('Failed to create campaign');
  return res.json();
}

export async function uploadImage(file: File): Promise<{ cid: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithTimeout('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (res.status === 413) throw new Error('File too large (max 5MB)');
  if (res.status === 415) throw new Error('Unsupported file type');
  if (res.status === 502) throw new Error('Failed to upload to IPFS gateway');
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}

export async function getUser(address: Address): Promise<UserProfile | null> {
  const res = await fetchWithTimeout(`/api/users/${address}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function upsertUser(input: UserProfile): Promise<UserProfile> {
  const res = await fetchWithTimeout(`/api/users/${input.address}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: input.displayName,
      bio: input.bio,
    }),
  });
  if (!res.ok) throw new Error('Failed to upsert user');
  return res.json();
}

export async function getContributions(campaignId: number): Promise<Contribution[]> {
  const res = await fetchWithTimeout(`/api/campaigns/${campaignId}/contributions`);
  if (!res.ok) throw new Error('Failed to fetch contributions');
  return res.json();
}
