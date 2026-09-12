import type { CampaignMeta, CampaignChain } from '@/lib/types';
import CampaignCard from './CampaignCard';
import CampaignCardSkeleton from './CampaignCardSkeleton';
import EmptyState from './EmptyState';

interface CampaignGridProps {
  campaigns: CampaignMeta[];
  chains: CampaignChain[];
  isLoading: boolean;
}

export default function CampaignGrid({ campaigns, chains, isLoading }: CampaignGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CampaignCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((meta) => {
        const chain = chains.find((c) => c.campaignId === meta.campaignId);
        return <CampaignCard key={meta.campaignId} meta={meta} chain={chain} />;
      })}
    </div>
  );
}
