export const CHAIN_ID = 80002;
export const CHAIN_NAME = 'Polygon Amoy';
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs/';
export const EXPLORER_URL = 'https://amoy.polygonscan.com';
export const CAMPAIGN_TAGS = [
  'Education',
  'Environment',
  'Health',
  'Technology',
  'Community',
  'Animals',
  'Arts',
  'Sports',
  'Emergency',
  'Other',
];
