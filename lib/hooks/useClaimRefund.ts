// STUB - replaced by M1 in Week 2. Do not change the exported signature.
'use client';

import { useState, useCallback } from 'react';

export function useClaimRefund(_id: number) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const claimRefund = useCallback(async () => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTxHash('0xmock_refund_tx_' + Date.now().toString(16));
    setIsSuccess(true);
    setIsPending(false);
  }, []);

  return { claimRefund, isPending, isSuccess, txHash, error };
}
