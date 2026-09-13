'use client';

/**
 * app/create/page.tsx
 * The "Start a campaign" page: if the user's wallet is not connected it shows a
 * friendly prompt card instead of the form; once connected, it renders the full
 * CreateCampaignForm centred inside a max-w-2xl container.
 */

import { useWallet } from '@/lib/hooks/useWallet';
import CreateCampaignForm from '@/components/create/CreateCampaignForm';
import Button from '@/components/ui/Button';

export default function CreateCampaignPage() {
  const { isConnected, connect } = useWallet();

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16">
      {/* Page header */}
      <div className="mx-auto max-w-2xl mb-10 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Start a campaign
        </h1>
        <p className="mt-3 text-base text-neutral-400">
          Fill in the details below and launch your fundraiser directly on the blockchain — no middlemen, no hidden fees.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {isConnected ? (
          /* ── Form (wallet connected) ── */
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
            <CreateCampaignForm />
          </div>
        ) : (
          /* ── Connect-wallet prompt ── */
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-10 shadow-xl text-center space-y-5">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/20 text-4xl">
              🔐
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Connect your wallet to create a campaign
              </h2>
              <p className="text-sm text-neutral-400">
                You need a Web3 wallet (e.g. MetaMask) to sign and publish your campaign on-chain.
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              onClick={connect}
              className="mx-auto"
              id="connect-wallet-btn"
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
