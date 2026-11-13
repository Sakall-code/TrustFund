import Link from 'next/link';
import { EXPLORER_URL, CONTRACT_ADDRESS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-12 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">TrustFund</h3>
            <p className="text-slate-400 text-sm">
              A decentralized crowdfunding platform ensuring secure, goal-driven fund allocation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Explore</Link></li>
              <li><Link href="/create" className="text-slate-400 hover:text-white transition-colors">Create Campaign</Link></li>
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Built With</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Polygon Amoy</li>
              <li>IPFS / Pinata</li>
              <li>MongoDB Atlas</li>
              <li>Next.js</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Team Name. All rights reserved.</p>
          <a 
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Verified Contract: {CONTRACT_ADDRESS.slice(0,6)}...{CONTRACT_ADDRESS.slice(-4)}
          </a>
        </div>
      </div>
    </footer>
  );
}
