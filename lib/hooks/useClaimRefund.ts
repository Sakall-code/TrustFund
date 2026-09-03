import { useState } from 'react';
import toast from 'react-hot-toast';

export function useClaimRefund(id: number) {
  const [isPending, setIsPending] = useState(false);
  const claimRefund = async () => {
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success('Refund claimed successfully!');
    }, 1000);
  };
  return { claimRefund, isPending, isSuccess: false, txHash: '', error: null };
}
