'use client';

import { useState, useEffect } from 'react';
import { getContributions } from '@/lib/api';
import type { Contribution } from '@/lib/types';
import { shortAddress, weiToMatic } from '@/lib/format';
import { EXPLORER_URL } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

export default function BackersList({ campaignId }: { campaignId: number }) {
  const [backers, setBackers] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    getContributions(campaignId).then((data) => {
      if (mounted) {
        const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
        setBackers(sorted);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [campaignId]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse space-y-4">
        <div className="h-6 bg-gray-800 rounded w-1/4"></div>
        <div className="h-12 bg-gray-800 rounded"></div>
        <div className="h-12 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (backers.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center py-10">
        <p className="text-gray-400">Be the first to back this.</p>
      </div>
    );
  }

  const displayedBackers = showAll ? backers : backers.slice(0, 10);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-6">Recent Backers</h3>
      
      <div className="space-y-4">
        {displayedBackers.map((backer) => (
          <div key={backer.txHash} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-mono">
                {backer.backer.slice(2, 4)}
              </div>
              <div>
                <div className="text-gray-200 font-mono text-sm">
                  {shortAddress(backer.backer)}
                </div>
                <div className="text-gray-500 text-xs">
                  {formatDistanceToNow(backer.timestamp * 1000, { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">
                {weiToMatic(backer.amountWei)} MATIC
              </div>
              <a 
                href={`${EXPLORER_URL}/tx/${backer.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                View Tx ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {backers.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-6 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          {showAll ? 'Show less' : `Show all (${backers.length})`}
        </button>
      )}
    </div>
  );
}
