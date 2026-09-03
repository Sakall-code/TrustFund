import { useState } from 'react';
import toast from 'react-hot-toast';

export function useWithdraw(id: number) {
  const [isPending, setIsPending] = useState(false);
  const withdraw = async () => {
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success('Funds withdrawn successfully!');
    }, 1000);
  };
  return { withdraw, isPending, isSuccess: false, txHash: '', error: null };
}
