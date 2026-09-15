'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ deadline }: { deadline: number }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Campaign ended');
        return;
      }

      const d = Math.floor(diff / (24 * 3600));
      const h = Math.floor((diff % (24 * 3600)) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      setTimeLeft(`${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s left`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
      <div className="text-sm text-gray-400 mb-2">Time Remaining</div>
      <div className="text-2xl font-mono text-white font-semibold">
        {timeLeft || <span className="opacity-0">Loading...</span>}
      </div>
    </div>
  );
}
