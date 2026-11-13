import { EXPLORER_URL } from '@/lib/constants';
import Spinner from '@/components/ui/Spinner';

interface TxStatusProps {
  isPending: boolean;
  isSuccess: boolean;
  txHash?: string | null;
  error?: string | Error | null;
  successMessage?: string;
}

/** Maps raw error strings to short, human-readable messages. */
function friendlyError(raw: string | Error): string {
  const message = typeof raw === 'string' ? raw : raw.message;
  const lower = message.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('user denied') || lower.includes('rejected the request'))
    return 'You cancelled the transaction.';
  if (lower.includes('insufficient funds') || lower.includes('not enough'))
    return 'Not enough test POL for gas. Get more from the faucet.';
  if (lower.includes('wrong network') || lower.includes('chain mismatch') || lower.includes('switch'))
    return 'Please switch your wallet to Polygon Amoy.';
  return 'Something went wrong. Please try again.';
}

export default function TxStatus({ isPending, isSuccess, txHash, error, successMessage }: TxStatusProps) {
  if (isPending) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-blue-900/30 border border-blue-800 p-4 mt-4">
        <Spinner size="sm" className="text-blue-400 shrink-0" />
        <span className="text-blue-300 text-sm">Confirm in your wallet, then wait a few seconds…</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-green-900/30 border border-green-800 p-4 mt-4">
        {/* Tick */}
        <svg className="h-5 w-5 text-green-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-green-300 text-sm font-medium">{successMessage ?? 'Thank you! Transaction confirmed.'}</p>
          {txHash && (
            <a
              href={`${EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-xs underline"
            >
              View on explorer ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-red-900/30 border border-red-800 p-4 mt-4">
        <svg className="h-5 w-5 text-red-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 00-2 0v4a1 1 0 002 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <p className="text-red-300 text-sm">{friendlyError(error)}</p>
      </div>
    );
  }

  return null;
}
