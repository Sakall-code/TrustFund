import Link from 'next/link';

export function DashboardEmpty({ kind }: { kind: 'campaigns' | 'contributions' }) {
  return (
    <div className="py-12 text-center bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
      <p className="text-slate-400 mb-4">
        {kind === 'campaigns' 
          ? "You have not created any campaigns yet." 
          : "You have not backed any campaigns yet."}
      </p>
      <Link 
        href={kind === 'campaigns' ? '/create' : '/'}
        className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
      >
        {kind === 'campaigns' ? "Create Campaign" : "Explore Campaigns"}
      </Link>
    </div>
  );
}
