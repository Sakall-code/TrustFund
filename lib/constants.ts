export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
export const CHAIN_NAME = CHAIN_ID === 31337 ? 'Hardhat Local' : 'Polygon Amoy';
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;
export const DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || '0');
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs/';
export const EXPLORER_URL =
  CHAIN_ID === 31337
    ? 'http://127.0.0.1:8545'
    : 'https://amoy.polygonscan.com';
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
