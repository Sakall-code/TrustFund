import { format } from 'date-fns';
import type { CampaignMeta } from '@/lib/types';
import { ipfsUrl, shortAddress } from '@/lib/format';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';

export default function CampaignHeader({ meta }: { meta: CampaignMeta }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-6">
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden bg-gray-800">
        <img
          src={imgError ? 'https://placehold.co/1200x600/333/999?text=Campaign+Image' : ipfsUrl(meta.imageCid)}
          alt={meta.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">{meta.title}</h1>
        
        <div className="flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <Badge key={tag} className="px-3 py-1 bg-blue-900/50 text-blue-300 border-none text-sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            {meta.creatorAddress.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className="text-gray-200 font-medium">
              By {meta.creatorName || shortAddress(meta.creatorAddress)}
            </div>
            <div className="text-gray-400 text-sm">
              Created {format(new Date(meta.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none pt-4 border-t border-gray-800">
        <p className="whitespace-pre-line text-gray-300 leading-relaxed text-lg">
          {meta.description}
        </p>
      </div>
    </div>
  );
}
