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

  const {
    withdraw,
    isPending: withdrawPending,
    isSuccess: withdrawSuccess,
    txHash: withdrawHash,
    error: withdrawError,
  } = useWithdraw(campaignId);

  const {
    claimRefund,
    isPending: refundPending,
    isSuccess: refundSuccess,
    txHash: refundHash,
    error: refundError,
  } = useClaimRefund(campaignId);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!chain) return null;

  const isCreator = Boolean(
    isConnected && address && address.toLowerCase() === chain.owner.toLowerCase()
  );
  const now = Math.floor(Date.now() / 1000);
  const isExpired = chain.deadline < now;

  const raisedWei = BigInt(chain.raisedWei || '0');
  const unlockedWei = BigInt(chain.unlockedWei || '0');
  const withdrawnWei = BigInt(chain.withdrawnWei || '0');
  const goalWei = BigInt(chain.goalWei || '0');

  // Creator tranche withdrawal logic (Allowed BEFORE or AFTER deadline)
  const canWithdraw = isCreator && unlockedWei > withdrawnWei;
  const payoutWei = canWithdraw ? unlockedWei - withdrawnWei : 0n;
  const payoutMatic = weiToMatic(payoutWei.toString());
  const withdrawnMatic = weiToMatic(withdrawnWei.toString());

  // Next soft cap target for creator
  const softCaps =
    chain.softCapsWei && chain.softCapsWei.length > 0
      ? chain.softCapsWei
      : [chain.goalWei];
  const nextSoftCapWei = softCaps.find((cap) => BigInt(cap) > unlockedWei);
  const nextTargetMatic = nextSoftCapWei ? weiToMatic(nextSoftCapWei) : null;

  // Backer pro-rata overflow refund logic (AFTER deadline only)
  const userContributionWei = contributions
    .filter((c) => c.campaignId === campaignId)
    .reduce((sum, c) => sum + BigInt(c.amountWei), 0n);

  const overflowWei = raisedWei > unlockedWei ? raisedWei - unlockedWei : 0n;
  const canRefund =
    isConnected &&
    !isCreator &&
    isExpired &&
    overflowWei > 0n &&
    userContributionWei > 0n;

  const userRefundWei =
    canRefund && raisedWei > 0n
      ? (userContributionWei * overflowWei) / raisedWei
      : 0n;

  const userRefundNum = Number(weiToMatic(userRefundWei.toString()));
  const userRefundFormatted =
    userRefundNum % 1 === 0
      ? userRefundNum.toFixed(2)
      : userRefundNum.toFixed(4);

  const userContribMatic = weiToMatic(userContributionWei.toString());
  const unlockedMatic = weiToMatic(unlockedWei.toString());
  const overflowMatic = weiToMatic(overflowWei.toString());

  // Check if anything should be displayed in the panel
  const shouldRender =
    canWithdraw ||
    canRefund ||
    (isCreator && (withdrawnWei > 0n || isExpired)) ||
    (!isCreator && isExpired);

  if (!shouldRender) return null;

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
        {/* ── CREATOR ACTIONS ── */}
        {isCreator && (
          <div className="space-y-3">
            {canWithdraw ? (
              <>
                <button
                  onClick={handleWithdrawClick}
                  disabled={withdrawPending}
                  className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition-colors shadow-lg shadow-green-900/30"
                >
                  Withdraw Unlocked Tranche ({payoutMatic} MATIC)
                </button>
                <div className="text-xs text-gray-400 bg-gray-950/50 p-3 rounded-lg border border-gray-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Already withdrawn:</span>
                    <span className="text-gray-200 font-medium">{withdrawnMatic} MATIC</span>
                  </div>
                  {nextTargetMatic ? (
                    <div className="flex justify-between">
                      <span>Next milestone target:</span>
                      <span className="text-emerald-400 font-medium">{nextTargetMatic} MATIC</span>
                    </div>
                  ) : (
                    <div className="text-emerald-400 font-medium">Final goal fully unlocked!</div>
                  )}
                </div>
                <TxStatus
                  isPending={withdrawPending}
                  isSuccess={withdrawSuccess}
                  txHash={withdrawHash}
                  error={withdrawError}
                />
              </>
            ) : withdrawnWei >= unlockedWei && unlockedWei > 0n ? (
              <div className="text-center p-3 bg-gray-950/60 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-300 font-medium">
                  All currently unlocked funds have been withdrawn ({withdrawnMatic} MATIC).
                </p>
                {nextTargetMatic && (
                  <p className="text-xs text-gray-400 mt-1">
                    Next milestone target: <span className="text-emerald-400">{nextTargetMatic} MATIC</span>
                  </p>
                )}
              </div>
            ) : isExpired && unlockedWei === 0n ? (
              <p className="text-gray-400 text-center font-medium text-sm">
                This campaign ended without reaching the initial soft cap. Backers can claim 100% refunds.
              </p>
            ) : null}
          </div>
        )}

        {/* ── BACKER REFUND ACTIONS (Post-Deadline) ── */}
        {!isCreator && isExpired && (
          <div className="space-y-3">
            {canRefund ? (
              <>
                {/* Milestone explanation badge */}
                <div className="bg-amber-950/40 border border-amber-600/30 rounded-lg p-3 text-xs text-amber-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>
                      {unlockedWei > 0n
                        ? 'Milestone Protected Pro-Rata Refund'
                        : '100% Full Refund Available'}
                    </span>
                  </div>
                  <p className="text-amber-300/80 leading-relaxed">
                    {unlockedWei > 0n ? (
                      <>
                        The creator reached and unlocked <span className="font-semibold text-white">{unlockedMatic} MATIC</span> for project milestones.
                        The un-unlocked overflow (<span className="font-semibold text-white">{overflowMatic} MATIC</span>) is refundable pro-rata to all backers.
                      </>
                    ) : (
                      'The campaign did not reach its initial soft cap. All contributions are 100% refundable.'
                    )}
                  </p>
                </div>

                <button
                  onClick={handleRefund}
                  disabled={refundPending}
                  className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold transition-colors shadow-lg shadow-red-900/30"
                >
                  Claim Pro-Rata Refund ({userRefundFormatted} MATIC)
                </button>
                <p className="text-xs text-center text-gray-400">
                  Your total contributed: {userContribMatic} MATIC
                </p>
                <TxStatus
                  isPending={refundPending}
                  isSuccess={refundSuccess}
                  txHash={refundHash}
                  error={refundError}
                />
              </>
            ) : raisedWei >= goalWei ? (
              <p className="text-gray-400 text-center font-medium text-sm">
                This campaign fully met its goal! All funds are unlocked for the creator.
              </p>
            ) : overflowWei === 0n ? (
              <p className="text-gray-400 text-center font-medium text-sm">
                Campaign landed strictly on a milestone with zero excess overflow. Funds are committed to the creator.
              </p>
            ) : userContributionWei === 0n ? (
              <p className="text-gray-400 text-center font-medium text-sm">
                This campaign has ended. You have no active contributions to refund.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Withdraw confirmation modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm tranche withdrawal"
      >
        <p className="text-gray-300 text-sm mb-4">
          You are about to withdraw <span className="font-semibold text-white">{payoutMatic} MATIC</span> from your unlocked milestone tranche. This action cannot be undone.
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
