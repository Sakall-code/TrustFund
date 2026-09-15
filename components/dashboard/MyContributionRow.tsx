'use client';
import { Contribution, CampaignChain } from '@/lib/types';
import { useClaimRefund } from '@/lib/hooks/useClaimRefund';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function MyContributionRow({ 
  contribution, 
  campaign, 
  metaTitle,
  currentTimestamp 
}: { 
  contribution: Contribution; 
  campaign?: CampaignChain; 
  metaTitle?: string;
  currentTimestamp?: number;
}) {
  const { claimRefund, isPending } = useClaimRefund(contribution.campaignId);
  const [mountedNow, setMountedNow] = useState<number>(currentTimestamp || 0);

  useEffect(() => {
    if (!currentTimestamp) {
      const id = requestAnimationFrame(() => {
        setMountedNow(Math.floor(Date.now() / 1000));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [currentTimestamp]);

  const activeNow = currentTimestamp || mountedNow;
  const amount = Number(contribution.amountWei) / 1e18;
  const date = new Date(contribution.timestamp * 1000).toLocaleDateString();
  
  const isEnded = campaign && activeNow > 0 ? activeNow > campaign.deadline : false;
  const isFunded = campaign ? Number(campaign.raisedWei) >= Number(campaign.goalWei) : false;
  const canRefund = isEnded && !isFunded;

  let statusText = "Active";
  if (isEnded) statusText = isFunded ? "Succeeded" : "Failed (Refundable)";

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl mb-4 gap-4">
      <div>
        <h3 className="font-semibold text-white mb-1">{metaTitle || `Campaign #${contribution.campaignId}`}</h3>
        <p className="text-sm text-slate-400">Contributed {amount} MATIC • {date}</p>
        <p className="text-xs text-slate-500 mt-1">Status: {statusText}</p>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {canRefund && (
          <button
            onClick={claimRefund}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isPending && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
            Claim Refund
          </button>
        )}
        <Link 
          href={`/campaign/${contribution.campaignId}`}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}
