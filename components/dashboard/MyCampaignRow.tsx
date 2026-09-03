'use client';
import { CampaignChain } from '@/lib/types';
import { useWithdraw } from '@/lib/hooks/useWithdraw';
import Link from 'next/link';

export function MyCampaignRow({ campaign, metaTitle }: { campaign: CampaignChain, metaTitle?: string }) {
  const { withdraw, isPending } = useWithdraw(campaign.campaignId);
  
  const raised = Number(campaign.raisedWei) / 1e18;
  const goal = Number(campaign.goalWei) / 1e18;
  const progress = Math.min((raised / goal) * 100, 100);
  
  const isEnded = (Date.now() / 1000) > campaign.deadline;
  const isFunded = raised >= goal;
  
  let statusBadge = <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Active</span>;
  if (campaign.claimed) {
    statusBadge = <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Claimed</span>;
  } else if (isEnded) {
    if (isFunded) {
      statusBadge = <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">Funded</span>;
    } else {
      statusBadge = <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">Failed</span>;
    }
  }

  const canWithdraw = isEnded && isFunded && !campaign.claimed;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl mb-4 gap-4">
      <div className="flex-grow w-full md:w-auto">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-white">{metaTitle || `Campaign #${campaign.campaignId}`}</h3>
          {statusBadge}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
          <span>{raised} / {goal} MATIC</span>
        </div>
        
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {canWithdraw && (
          <button
            onClick={withdraw}
            disabled={isPending}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isPending && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
            Withdraw
          </button>
        )}
        <Link 
          href={`/campaign/${campaign.campaignId}`}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}
