# Technical Architecture

## Folder Structure

- `app/` - Next.js App Router pages and global layouts.
- `components/` - Reusable UI components grouped by feature (e.g., `dashboard/`, `layout/`).
- `contracts/` - Solidity smart contract source files.
- `docs/` - Technical documentation and architecture diagrams.
- `lib/` - Shared utilities, API clients, type definitions, and hooks.
- `models/` - Mongoose schemas for MongoDB integration.
- `scripts/` - Hardhat deployment and testing scripts.

## On-Chain vs Off-Chain Data Split

To keep transaction costs low and performance high, data is strictly separated:

**On-Chain (Polygon Amoy)**
- Goal amounts, amounts raised, deadlines, owner addresses, and backer contributions.
- *Reason:* This is the "trust layer". Financial state must be mathematically verifiable and immutable.

**Off-Chain (MongoDB & IPFS)**
- Campaign titles, descriptions, tags, user profiles, and image CIDs.
- *Reason:* Storing large text strings and images on a blockchain is prohibitively expensive. This data does not dictate where money flows, so it can safely live off-chain.

## The Frozen Interface Contract

To allow a 6-person team to work in parallel, we established a "frozen interface" on Day 1. 

Files like `lib/api.ts` (off-chain data) and `lib/hooks/*` (on-chain data) were defined as empty stubs returning realistic mock data. Because these data shapes (`Campaign`, `Contribution`) were strictly typed and never changed, frontend developers could build entire pages without waiting for the smart contract or database developers to finish their work. There were zero merge conflicts because the integration points were established in advance.

## Campaign Creation Sequence (3 Steps)

When a user creates a campaign, the frontend orchestrates a 3-step process:

1. **Upload Media**: The campaign thumbnail is sent via API route to Pinata/IPFS. Pinata returns a permanent Content Identifier (CID).
2. **Save Metadata**: The title, description, and the new CID are saved to MongoDB via an API route. MongoDB returns an auto-incrementing `campaignId`.
3. **Deploy On-Chain**: The user's wallet is prompted to call `createCampaign` on the smart contract, passing the `campaignId`, `goalWei`, and `deadline`. Once mined, the campaign is officially live.

## Environment Variables

| Variable | Environment | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Client | Required for RainbowKit wallet connection UI. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Client | The address of our deployed Solidity contract. |
| `MONGODB_URI` | Server | Connection string for the MongoDB Atlas database. |
| `PINATA_API_KEY` | Server | API key for pinning images to IPFS. |
| `PINATA_SECRET_API_KEY` | Server | Secret key for pinning images to IPFS. |
