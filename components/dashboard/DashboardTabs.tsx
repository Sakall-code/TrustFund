'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export function DashboardTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'campaigns';

  return (
    <div className="flex border-b border-slate-800 mb-6">
      <button
        onClick={() => router.push('?tab=campaigns')}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          currentTab === 'campaigns'
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        My Campaigns
      </button>
      <button
        onClick={() => router.push('?tab=contributions')}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          currentTab === 'contributions'
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        My Contributions
      </button>
    </div>
  );
}
