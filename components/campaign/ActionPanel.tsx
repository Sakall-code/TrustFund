'use client';

import { useState } from 'react';
import type { CampaignChain } from '@/lib/types';
import { useWallet } from '@/lib/hooks/useWallet';
import { useWithdraw } from '@/lib/hooks/useWithdraw';
import { useClaimRefund } from '@/lib/hooks/useClaimRefund';
import { useMyContributions } from '@/lib/hooks/useMyContributions';
import { weiToMatic } from '@/lib/format';
import TxStatus from '@/components/campaign/TxStatus';
import Modal from '@/components/ui/Modal';

interface ActionPanelProps {
  campaignId: number;
  chain: CampaignChain | null;
}

export default function ActionPanel({ campaignId, chain }: ActionPanelProps) {
  const { address, isConnected } = useWallet();
  const { data: contributions } = useMyContributions(address);

  const { withdraw, isPending: withdrawPending, isSuccess: withdrawSuccess, txHash: withdrawHash, error: withdrawError } = useWithdraw(campaignId);
  const { claimRefund, isPending: refundPending, isSuccess: refundSuccess, txHash: refundHash, error: refundError } = useClaimRefund(campaignId);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!chain) return null;

  // Is the current connected wallet the creator of this campaign?
  const isCreator = Boolean(isConnected && address && address.toLowerCase() === chain.owner.toLowerCase());

  // Has the campaign's deadline passed?
  const hasEnded = chain.deadline < Math.floor(Date.now() / 1000);

  // Has the campaign met or exceeded its funding goal?
  const goalMet = BigInt(chain.raisedWei) >= BigInt(chain.goalWei);

  // Does the connected wallet have a contribution greater than 0?
  const hasContribution = contributions.some((c) => c.campaignId === campaignId && BigInt(c.amountWei) > 0n);

  // Can the creator withdraw funds? (connected, creator, ended, goal met, not claimed)
  const canWithdraw = isCreator && hasEnded && goalMet && !chain.claimed;

  // Can the backer claim a refund? (connected, ended, goal not met, has contribution)
  const canRefund = isConnected && hasEnded && !goalMet && hasContribution;

  // State: Creator has already claimed the funds
  const showCreatorClaimed = isCreator && hasEnded && goalMet && chain.claimed;

  // State: Creator viewing a failed campaign
  const showCreatorFailed = isCreator && hasEnded && !goalMet;

  // State: Backer viewing a successful campaign
  const showBackerSuccess = !isCreator && hasEnded && goalMet;

  // Campaign still active -> render nothing at all
  if (!hasEnded) return null;

  // If no state matches, render nothing
  if (!canWithdraw && !canRefund && !showCreatorClaimed && !showCreatorFailed && !showBackerSuccess) {
    return null;
  }

  const raisedMatic = weiToMatic(chain.raisedWei);

  const userContributionWei = contributions
    .filter((c) => c.campaignId === campaignId)
    .reduce((sum, c) => sum + BigInt(c.amountWei), 0n);
  const userRefundMatic = weiToMatic(userContributionWei.toString());

  const handleWithdrawClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmWithdraw = async () => {
    setShowConfirmModal(false);
    await withdraw();
  };

  const handleRefund = async () => {
    await claimRefund();
  };

  return (
    <>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
        {canWithdraw && (
          <>
            <button
              onClick={handleWithdrawClick}
              disabled={withdrawPending}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              Withdraw {raisedMatic} MATIC
            </button>
            <TxStatus isPending={withdrawPending} isSuccess={withdrawSuccess} txHash={withdrawHash} error={withdrawError} />
          </>
        )}

        {canRefund && (
          <>
            <button
              onClick={handleRefund}
              disabled={refundPending}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              Claim refund of {userRefundMatic} MATIC
            </button>
            <TxStatus isPending={refundPending} isSuccess={refundSuccess} txHash={refundHash} error={refundError} />
          </>
        )}

        {showCreatorClaimed && (
          <p className="text-gray-400 text-center font-medium">You have already withdrawn these funds.</p>
        )}

        {showCreatorFailed && !canRefund && (
          <p className="text-gray-400 text-center font-medium">This campaign did not reach its goal. Backers can claim refunds.</p>
        )}

        {showBackerSuccess && (
          <p className="text-gray-400 text-center font-medium">This campaign succeeded. Funds go to the creator.</p>
        )}
      </div>

      {/* Withdraw confirmation modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm withdrawal">
        <p className="text-gray-300 text-sm mb-4">
          You are about to withdraw <span className="font-semibold text-white">{raisedMatic} MATIC</span> from this campaign. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmWithdraw}
            className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
          >
            Withdraw
          </button>
        </div>
      </Modal>
    </>
  );
}
