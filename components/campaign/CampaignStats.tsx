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

  const unlockedMatic = weiToMatic(chain.unlockedWei || '0');
  const withdrawnMatic = weiToMatic(chain.withdrawnWei || '0');
  const softCaps = chain.softCapsWei && chain.softCapsWei.length > 0
    ? chain.softCapsWei
    : [chain.goalWei];

  let statusText = 'Active';
  let statusVariant: 'default' | 'success' | 'warning' | 'danger' = 'success';

  if (chain.claimed) {
    statusText = 'Funds claimed';
    statusVariant = 'default';
  } else if (isFunded) {
    statusText = 'Funded';
    statusVariant = 'success';
  } else if (isEnded) {
    if (BigInt(chain.unlockedWei || '0') > 0n) {
      statusText = 'Partially Unlocked';
      statusVariant = 'warning';
    } else {
      statusText = 'Ended - not funded';
      statusVariant = 'danger';
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-white">Campaign Stats</h3>
        <Badge variant={statusVariant}>{statusText}</Badge>
      </div>

      <ProgressBar value={percent} className="mb-2" />

      {/* Soft-Cap Checkpoints Tracker */}
      <div className="bg-gray-950/60 rounded-lg p-4 border border-gray-800/80 space-y-3">
        <div className="flex justify-between items-center text-xs font-medium text-gray-400">
          <span className="uppercase tracking-wider">Soft-Cap Checkpoints</span>
          <span className="text-gray-300">
            {softCaps.filter((cap) => BigInt(chain.raisedWei) >= BigInt(cap)).length} / {softCaps.length} reached
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {softCaps.map((capWei, idx) => {
            const capMatic = weiToMatic(capWei);
            const isReached = BigInt(chain.raisedWei) >= BigInt(capWei);
            const isLast = idx === softCaps.length - 1;

            return (
              <span
                key={idx}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isReached
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-gray-900 border-gray-700/60 text-gray-400'
                }`}
              >
                {isReached ? (
                  <span className="mr-1.5 text-emerald-400 font-bold">✓</span>
                ) : (
                  <span className="mr-1.5 text-gray-500">🔒</span>
                )}
                {capMatic} MATIC {isReached ? 'Unlocked' : isLast ? 'Final Goal' : 'Locked'}
              </span>
            );
          })}
        </div>

        <div className="pt-2 border-t border-gray-800/60 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-900/80 rounded px-2.5 py-1.5 border border-gray-800">
            <span className="text-gray-400 block">Unlocked:</span>
            <span className="font-semibold text-emerald-400 text-sm">{unlockedMatic} MATIC</span>
          </div>
          <div className="bg-gray-900/80 rounded px-2.5 py-1.5 border border-gray-800">
            <span className="text-gray-400 block">Withdrawn by Creator:</span>
            <span className="font-semibold text-blue-400 text-sm">{withdrawnMatic} MATIC</span>
          </div>
        </div>
      </div>

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
