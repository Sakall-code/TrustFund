'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getCampaignMeta } from '@/lib/api';
import { useCampaignChain } from '@/lib/hooks/useCampaignChain';
import type { CampaignMeta } from '@/lib/types';

import CampaignHeader from '@/components/campaign/CampaignHeader';
import CampaignStats from '@/components/campaign/CampaignStats';
import CountdownTimer from '@/components/campaign/CountdownTimer';
import BackersList from '@/components/campaign/BackersList';
import CampaignDetailSkeleton from '@/components/campaign/CampaignDetailSkeleton';
import DonateBox from '@/components/campaign/DonateBox';
import ActionPanel from '@/components/campaign/ActionPanel';

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaignId = parseInt(resolvedParams.id, 10);
  const [meta, setMeta] = useState<CampaignMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: chain, isLoading: chainLoading } = useCampaignChain(campaignId);

  useEffect(() => {
    let mounted = true;
    if (!isNaN(campaignId)) {
      getCampaignMeta(campaignId).then((data) => {
        if (mounted) {
          setMeta(data);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [campaignId]);

  if (loading || chainLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Campaign not found</h2>
          <p className="text-gray-400 mb-6">The campaign you are looking for does not exist or has been removed.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <CampaignHeader meta={meta} />
          <BackersList campaignId={campaignId} />
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          <div className="sticky top-8 space-y-6">
            <CampaignStats chain={chain} />
            {chain && <CountdownTimer deadline={chain.deadline} />}
            <DonateBox campaignId={campaignId} chain={chain} />
            <ActionPanel campaignId={campaignId} chain={chain} />
          </div>
        </div>
      </div>
    </div>
  );
}
