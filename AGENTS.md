# AGENTS.md — CrowdFund dApp Team Assignment

> **Rule: Never edit files you do not own.** If a file is assigned to another member, open a PR or ask them directly.

## Team Members & Ownership

| Member | Role                      | Owned Files / Directories                                                                 |
|--------|---------------------------|-------------------------------------------------------------------------------------------|
| **M1** | Blockchain & Wallet       | `contracts/`, `scripts/`, `test/`, `lib/wagmi.ts`, `lib/hooks/*`, `lib/abi/`, `hardhat.config.*` |
| **M2** | Backend & API             | `app/api/`, `lib/api.ts`, `models/`, `lib/mock/`                                         |
| **M3** | Home Page & Layout        | `app/page.tsx`, `app/layout.tsx`, `app/providers.tsx`, `components/layout/`, `components/home/` |
| **M4** | Campaign Detail Page      | `app/campaign/`, `components/campaign/`                                                   |
| **M5** | Create Campaign Page      | `app/create/`, `components/create/`                                                       |
| **M6** | Dashboard Page            | `app/dashboard/`, `components/dashboard/`                                                 |

## Shared / Frozen Files

The following files are **shared infrastructure** and must NOT be edited without team consensus:

| File                     | Purpose                          | Last Changed By |
|--------------------------|----------------------------------|-----------------|
| `lib/types.ts`           | Canonical TypeScript types       | Setup           |
| `lib/constants.ts`       | Chain & project constants        | Setup           |
| `lib/format.ts`          | Utility formatting helpers       | Setup           |
| `components/ui/*`        | Shared UI component library      | Setup           |
| `app/globals.css`        | Global Tailwind styles           | Setup           |
| `.env.example`           | Environment variable template    | Setup           |
| `package.json`           | Dependencies (do NOT add new)    | Setup           |
| `AGENTS.md`              | This file                        | Setup           |

## Hook Signatures (Frozen)

All hooks in `lib/hooks/` are currently **stubs** returning mock data. M1 will replace the
implementations in Week 2, but the **exported signatures must never change**:

```
useWallet()                → { address, isConnected, connect, disconnect }
useCampaignChain(id)       → { data, isLoading, error }
useAllCampaignChains()     → { data, isLoading, error }
useCreateCampaign()        → { create, isPending, isSuccess, txHash, error }
useDonate(id)              → { donate, isPending, isSuccess, txHash, error }
useWithdraw(id)            → { withdraw, isPending, isSuccess, txHash, error }
useClaimRefund(id)         → { claimRefund, isPending, isSuccess, txHash, error }
useMyContributions(addr)   → { data, isLoading, error }
```

## API Function Signatures (Frozen)

All functions in `lib/api.ts` are currently **stubs** returning mock data. M2 will replace
the implementations, but the **exported signatures must never change**:

```
listCampaigns()                         → Promise<Campaign[]>
getCampaignMeta(id)                     → Promise<CampaignMeta | null>
createCampaignMeta(data)                → Promise<CampaignMeta>
uploadImage(file)                       → Promise<string>
getUser(address)                        → Promise<UserProfile | null>
upsertUser(profile)                     → Promise<UserProfile>
getContributions(campaignId)            → Promise<Contribution[]>
```

## Git Workflow

1. Create a feature branch: `git checkout -b feat/M3-home-hero`
2. Only touch files you own (see table above).
3. Open a Pull Request; at least 1 approval required.
4. Squash-merge into `main`.

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```
