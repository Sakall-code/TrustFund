import { CONTRACT_ADDRESS } from '../constants';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  AlreadyClaimed: 'Funds have already been claimed',
  CampaignDoesNotExist: 'Campaign does not exist',
  CampaignEnded: 'Campaign deadline has passed',
  CampaignNotEnded: 'Campaign has not ended yet',
  GoalMet: 'Campaign goal was met; refunds are unavailable',
  GoalNotMet: 'Campaign goal was not reached',
  InvalidDeadline: 'Deadline must be at least 1 hour in the future',
  InvalidDonation: 'Donation amount must be greater than zero',
  InvalidGoal: 'Funding goal must be greater than zero',
  InvalidMetadata: 'Metadata CID cannot be empty',
  InvalidSoftCaps: 'Invalid soft cap milestones: must be positive and strictly ascending',
  NoContribution: 'No contribution found for this address',
  NoRefundAvailable: 'No refundable overflow available for this campaign',
  NothingToWithdraw: 'No unlocked funds available to withdraw',
  NotOwner: 'Only the campaign creator can perform this action',
  ReentrancyGuardReentrantCall: 'Reentrant call detected',
  TransferFailed: 'ETH transfer failed',
};

export function isContractConfigured(): boolean {
  return (
    typeof CONTRACT_ADDRESS === 'string' &&
    CONTRACT_ADDRESS.trim().length > 0 &&
    CONTRACT_ADDRESS.toLowerCase() !== ZERO_ADDRESS
  );
}

export function formatError(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as {
      shortMessage?: string;
      message?: string;
      data?: { errorName?: string };
      cause?: { code?: string; message?: string };
    };

    const fullText = `${errorObj.shortMessage || ''} ${errorObj.message || ''} ${errorObj.data?.errorName || ''} ${errorObj.cause?.message || ''}`;

    // 1. Check user rejection
    if (/user rejected|user denied/i.test(fullText)) {
      return 'User rejected request';
    }

    // 2. Check insufficient funds
    if (/insufficient funds/i.test(fullText)) {
      return 'Insufficient funds for gas or transaction value';
    }

    // 3. Check Hardhat node connection errors
    if (
      /fetch failed|ECONNREFUSED|Failed to fetch|NetworkError|connect ECONNREFUSED/i.test(
        fullText
      )
    ) {
      return 'Cannot connect to local Hardhat node at 127.0.0.1:8545 — run: npx hardhat node';
    }

    // 4. Check gas limit too high (MetaMask fallback when transaction reverts in simulation)
    if (/gas limit too high/i.test(fullText)) {
      return 'Transaction would fail on-chain (conditions not met, e.g. not owner or deadline not ended)';
    }

    // 5. Check contract custom errors
    for (const [errorName, message] of Object.entries(CUSTOM_ERROR_MESSAGES)) {
      if (fullText.includes(errorName)) {
        return message;
      }
    }

    // 6. Check for shortMessage provided by viem
    if (errorObj.shortMessage && typeof errorObj.shortMessage === 'string') {
      const cleaned = errorObj.shortMessage
        .replace(/^Execution reverted:?\s*/i, '')
        .trim();
      return cleaned || errorObj.shortMessage;
    }

    // 7. Fallback first line
    if (errorObj.message && typeof errorObj.message === 'string') {
      const firstLine = errorObj.message.split('\n')[0].trim();
      return firstLine.length > 120 ? firstLine.slice(0, 120) + '...' : firstLine;
    }
  }

  return 'An error occurred';
}
