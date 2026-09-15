# ROLE: M6 - Layout, Navbar, Dashboard & Docs

I own ONLY these files. Never create or edit anything outside this list:
  app/layout.tsx
  app/dashboard/page.tsx
  components/layout/**
  components/dashboard/**
  README.md
  docs/**

FROZEN - never modify, only read and import from:
  lib/types.ts, lib/constants.ts, lib/api.ts, lib/hooks/**, lib/format.ts, lib/mock/**,
  components/ui/**, app/providers.tsx, app/globals.css,
  package.json, tailwind.config.ts, AGENTS.md
  Any file under app/page.tsx, app/create, app/campaign, app/api, contracts/, models/

In app/layout.tsx I may only add the Navbar, Footer and Toaster around {children}.
I must NEVER remove or reorder the <Providers> wrapper - it powers the whole app.

Never run npm install. Everything I need is installed.
Never import ethers, viem or wagmi directly. Wallet state comes from useWallet() in lib/hooks.
Styling: Tailwind utility classes only.
Always run `npm run build` and report the result before saying a task is done.
