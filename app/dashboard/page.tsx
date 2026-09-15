'use client';

import { useWallet } from '@/lib/hooks/useWallet';
import { useAllCampaignChains } from '@/lib/hooks/useAllCampaignChains';
import { useMyContributions } from '@/lib/hooks/useMyContributions';
import { listCampaigns } from '@/lib/api';
import { shortAddress } from '@/lib/format';
import { useEffect, useState, Suspense } from 'react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { MyCampaignRow } from '@/components/dashboard/MyCampaignRow';
import { MyContributionRow } from '@/components/dashboard/MyContributionRow';
import { DashboardEmpty } from '@/components/dashboard/DashboardEmpty';
import { useSearchParams } from 'next/navigation';
import { CampaignMeta } from '@/lib/types';

function DashboardSkeletonRow() {
  return (
    <div className="animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl mb-4 gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto flex-grow">
        <div className="w-16 h-16 bg-slate-800 rounded-lg shrink-0" />
        <div className="flex-grow space-y-2 min-w-0">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
          <div className="h-2 bg-slate-800 rounded w-full" />
        </div>
      </div>
      <div className="h-9 w-20 bg-slate-800 rounded-lg shrink-0" />
    </div>
  );
}

function DashboardContent() {
  const { address, isConnected, connect } = useWallet();
  const { data: allChains, isLoading: isLoadingChains } = useAllCampaignChains();
  const { data: myContributions, isLoading: isLoadingContributions } = useMyContributions(address);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'campaigns';

  const [metaMap, setMetaMap] = useState<Record<number, { title: string; imageCid?: string }>>({});
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await listCampaigns();
        const map: Record<number, { title: string; imageCid?: string }> = {};
        res.items.forEach((item: CampaignMeta) => {
          map[item.campaignId] = {
            title: item.title,
            imageCid: item.imageCid
          };
        });
        setMetaMap(map);
      } catch {
        // Handle gracefully
      }
    }
    fetchMeta();
  }, []);

  if (!isConnected || !address) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-slate-400 mb-6">Connect your wallet to see your dashboard.</p>
        <button 
          onClick={connect}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium w-full transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Filter campaigns
  const myCampaigns = allChains?.filter(
    (c) => c.owner.toLowerCase() === address.toLowerCase()
  ) || [];

  const createdCount = myCampaigns.length;
  const totalRaised = myCampaigns.reduce((acc, c) => acc + Number(c.raisedWei) / 1e18, 0);

  const backedCount = myContributions?.length || 0;
  const totalContributed = myContributions?.reduce((acc, c) => acc + Number(c.amountWei) / 1e18, 0) || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">
        Dashboard <span className="text-slate-500 text-xl font-normal ml-2">{shortAddress(address)}</span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm mb-1">Campaigns Created</p>
          <p className="text-2xl font-bold text-white">{createdCount}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm mb-1">Total Raised</p>
          <p className="text-2xl font-bold text-white">{totalRaised} MATIC</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm mb-1">Campaigns Backed</p>
          <p className="text-2xl font-bold text-white">{backedCount}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm mb-1">Total Contributed</p>
          <p className="text-2xl font-bold text-white">{totalContributed} MATIC</p>
        </div>
      </div>

      <DashboardTabs />

      {activeTab === 'campaigns' && (
        <div>
          {isLoadingChains ? (
            <>
              <DashboardSkeletonRow />
              <DashboardSkeletonRow />
              <DashboardSkeletonRow />
            </>
          ) : myCampaigns.length === 0 ? (
            <DashboardEmpty kind="campaigns" />
          ) : (
            myCampaigns.map(c => (
              <MyCampaignRow 
                key={c.campaignId} 
                campaign={c} 
                metaTitle={metaMap[c.campaignId]?.title} 
                metaImageCid={metaMap[c.campaignId]?.imageCid}
                currentTimestamp={currentTimestamp}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'contributions' && (
        <div>
          {isLoadingContributions ? (
            <>
              <DashboardSkeletonRow />
              <DashboardSkeletonRow />
              <DashboardSkeletonRow />
            </>
          ) : (!myContributions || myContributions.length === 0) ? (
            <DashboardEmpty kind="contributions" />
          ) : (
            myContributions.map((contrib, i) => {
              const chain = allChains?.find(c => c.campaignId === contrib.campaignId);
              return (
                <MyContributionRow 
                  key={i} 
                  contribution={contrib} 
                  campaign={chain}
                  metaTitle={metaMap[contrib.campaignId]?.title}
                  currentTimestamp={currentTimestamp}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
