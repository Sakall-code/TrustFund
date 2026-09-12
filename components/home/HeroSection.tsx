'use client';

import Link from 'next/link';
import { Layers, Coins, Users } from 'lucide-react';
import type { CampaignMeta, CampaignChain } from '@/lib/types';
import { weiToMatic } from '@/lib/format';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  campaigns: CampaignMeta[];
  chains: CampaignChain[];
}

export default function HeroSection({ campaigns, chains }: HeroSectionProps) {
  const totalCampaigns = campaigns.length;

  const totalRaisedWei = chains.reduce((sum, c) => {
    try {
      return sum + BigInt(c.raisedWei || '0');
    } catch {
      return sum;
    }
  }, 0n);

  const totalRaisedMatic = parseFloat(weiToMatic(totalRaisedWei.toString()));
  const formattedRaised = isNaN(totalRaisedMatic)
    ? '0'
    : totalRaisedMatic.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const totalBackers = chains.reduce((count, c) => {
    const customCount =
      (c as unknown as { backersCount?: number; backers?: unknown[] }).backersCount ??
      (c as unknown as { backers?: unknown[] }).backers?.length;
    if (typeof customCount === 'number') return count + customCount;
    return count + (BigInt(c.raisedWei || '0') > 0n ? 1 : 0);
  }, 0);

  const scrollToGrid = () => {
    const gridEl = document.getElementById('campaigns');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background glow accent */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/15 to-cyan-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Big headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Fund Bold Ideas{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
            Directly on Chain
          </span>
        </h1>

        {/* One-line subtext explaining trustless crowdfunding */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-400 sm:text-lg">
          Transparent, trustless crowdfunding powered by smart contracts — zero middlemen, direct contributions, and automated refunds.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={scrollToGrid}>
            Explore campaigns
          </Button>

          <Link href="/create">
            <Button variant="secondary" size="lg">
              Start a campaign
            </Button>
          </Link>
        </div>

        {/* Three small stat chips computed from loaded data */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-2 text-sm backdrop-blur-sm">
            <Layers className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            <span className="font-semibold text-white">{totalCampaigns}</span>
            <span className="text-neutral-400">Campaigns</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-2 text-sm backdrop-blur-sm">
            <Coins className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            <span className="font-semibold text-white">{formattedRaised} MATIC</span>
            <span className="text-neutral-400">Raised</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-4 py-2 text-sm backdrop-blur-sm">
            <Users className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="font-semibold text-white">{totalBackers}</span>
            <span className="text-neutral-400">Backers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
