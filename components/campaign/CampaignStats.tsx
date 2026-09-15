import type { CampaignChain } from '@/lib/types';
import { weiToMatic, percentFunded } from '@/lib/format';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';

export default function CampaignStats({ chain }: { chain: CampaignChain | null }) {
  if (!chain) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
        <div className="h-4 bg-gray-800 rounded mb-4"></div>
        <div className="h-2 bg-gray-800 rounded-full mb-8"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-12 bg-gray-800 rounded"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const raised = Number(weiToMatic(chain.raisedWei));
  const goal = Number(weiToMatic(chain.goalWei));
  const percent = percentFunded(chain.raisedWei, chain.goalWei);
  
  const now = Math.floor(Date.now() / 1000);
  const isEnded = chain.deadline < now;
  const isFunded = raised >= goal;

  let statusText = 'Active';
  let statusVariant: 'default' | 'success' | 'warning' | 'danger' = 'success';

  if (chain.claimed) {
    statusText = 'Funds claimed';
    statusVariant = 'default';
  } else if (isFunded) {
    statusText = 'Funded';
    statusVariant = 'success';
  } else if (isEnded) {
    statusText = 'Ended - not funded';
    statusVariant = 'danger';
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-white">Campaign Stats</h3>
        <Badge variant={statusVariant}>{statusText}</Badge>
      </div>

      <ProgressBar value={percent} className="mb-2" />

      <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-800">
        <div>
          <div className="text-3xl font-bold text-white">{raised.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">MATIC Raised</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{goal.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">MATIC Goal</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{percent}%</div>
          <div className="text-sm text-gray-400 mt-1">Funded</div>
        </div>
      </div>
    </div>
  );
}
