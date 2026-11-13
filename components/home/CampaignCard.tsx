'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FolderOpen } from 'lucide-react';
import type { CampaignMeta, CampaignChain } from '@/lib/types';
import { weiToMatic, percentFunded, daysLeft, ipfsUrl, shortAddress } from '@/lib/format';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

interface CampaignCardProps {
  meta: CampaignMeta;
  chain?: CampaignChain;
}

export default function CampaignCard({ meta, chain }: CampaignCardProps) {
  const [imageError, setImageError] = useState(false);

  const raisedWei = chain?.raisedWei ?? '0';
  const goalWei = chain?.goalWei ?? '0';
  const percent = chain ? percentFunded(raisedWei, goalWei) : 0;
  const raisedMatic = chain ? weiToMatic(raisedWei) : '0';
  const goalMatic = chain ? weiToMatic(goalWei) : '0';

  const deadline = chain?.deadline ?? 0;
  const remainingDays = chain ? daysLeft(deadline) : 0;
  const isEnded = chain ? Math.floor(Date.now() / 1000) >= deadline : false;
  const isFunded = chain ? BigInt(raisedWei) >= BigInt(goalWei) && BigInt(goalWei) > 0n : false;

  const hasImageCid = Boolean(meta.imageCid && meta.imageCid.trim() !== '');
  const imageUrl = hasImageCid ? ipfsUrl(meta.imageCid) : null;

  const creatorDisplayName = meta.creatorName?.trim()
    ? meta.creatorName
    : shortAddress(meta.creatorAddress);

  return (
    <Link
      href={`/campaign/${meta.campaignId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-lg hover:shadow-indigo-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
    >
      {/* Media banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={meta.title || 'Campaign cover image'}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-500">
            <FolderOpen className="h-10 w-10 stroke-[1.5] text-neutral-600" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Tags (first 2) */}
        {meta.tags && meta.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {meta.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="mb-4 text-lg font-semibold text-white line-clamp-2 transition-colors group-hover:text-indigo-400">
          {meta.title}
        </h3>

        {/* Funding section */}
        <div className="mt-auto space-y-2">
          <ProgressBar value={percent} max={100} />

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-200">
              {raisedMatic} MATIC raised of {goalMatic} MATIC
            </span>

            <div className="flex items-center gap-1.5">
              {isFunded && <Badge variant="success">Funded</Badge>}
              {!isFunded && isEnded && <Badge variant="danger">Ended</Badge>}
              {!isEnded && (
                <span className="font-medium text-neutral-400">
                  {remainingDays} {remainingDays === 1 ? 'day' : 'days'} left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-800/80 pt-3 text-xs text-neutral-400">
          <span className="truncate">
            By <span className="font-medium text-neutral-300">{creatorDisplayName}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
