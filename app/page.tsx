'use client';

import { useState, useEffect, useCallback } from 'react';
import { listCampaigns } from '@/lib/api';
import { useAllCampaignChains } from '@/lib/hooks/useAllCampaignChains';
import type { CampaignMeta } from '@/lib/types';
import { CAMPAIGN_TAGS } from '@/lib/constants';
import HeroSection from '@/components/home/HeroSection';
import CampaignGrid from '@/components/home/CampaignGrid';
import CampaignCardSkeleton from '@/components/home/CampaignCardSkeleton';
import EmptyState from '@/components/home/EmptyState';
import SearchBar from '@/components/home/SearchBar';
import TagFilter from '@/components/home/TagFilter';
import Button from '@/components/ui/Button';
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react';

export default function HomePage() {
  const [items, setItems] = useState<CampaignMeta[]>([]);
  const [initialCampaigns, setInitialCampaigns] = useState<CampaignMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: chains, isLoading: isChainsLoading, error: chainsError } = useAllCampaignChains();

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qParam = query.trim() || undefined;
      const tagParam = activeTag || undefined;

      // Pass { q, tag } to listCampaigns
      const res = await listCampaigns({
        q: qParam,
        tag: tagParam,
      });
      const data: CampaignMeta[] = Array.isArray(res) ? res : res?.items ?? [];

      // Save initial campaigns for global stats if not yet recorded
      if (initialCampaigns.length === 0 && data.length > 0 && !qParam && !tagParam) {
        setInitialCampaigns(data);
      }

      // Filter results to support mock data stubs that return all campaigns
      let filtered = data;
      if (activeTag) {
        filtered = filtered.filter((c) => c.tags && c.tags.includes(activeTag));
      }
      if (qParam) {
        const qLower = qParam.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(qLower) ||
            c.description.toLowerCase().includes(qLower) ||
            c.tags.some((t) => t.toLowerCase().includes(qLower))
        );
      }

      setItems(filtered);
    } catch (_err) {
      setError(
        'Unable to load campaigns right now. Please check your network connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [query, activeTag, initialCampaigns.length]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleClearFilters = () => {
    setQuery('');
    setActiveTag(null);
  };

  const hasError = Boolean(error || chainsError);
  const isPageLoading = isLoading || isChainsLoading;
  const hasActiveFilters = Boolean(query.trim() || activeTag);

  const resultText = query.trim()
    ? `${items.length} ${items.length === 1 ? 'result' : 'results'} for '${query.trim()}'`
    : `${items.length} ${items.length === 1 ? 'campaign' : 'campaigns'}`;

  return (
    <div className="min-h-screen pb-20">
      <HeroSection
        campaigns={initialCampaigns.length > 0 ? initialCampaigns : items}
        chains={chains}
      />

      <main id="campaigns" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Explore Campaigns
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Discover and back verified projects building on decentralized infrastructure.
              </p>
            </div>
          </div>

          {/* SearchBar and TagFilter above the grid */}
          <div className="flex flex-col gap-3 pt-2">
            <SearchBar value={query} onChange={setQuery} />
            <TagFilter
              tags={CAMPAIGN_TAGS}
              selected={activeTag}
              onSelect={setActiveTag}
            />
          </div>

          {/* Result count line above the grid */}
          {!isPageLoading && !hasError && (
            <div className="pt-2 text-sm font-medium text-neutral-400">
              {resultText}
            </div>
          )}
        </div>

        {hasError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/20 p-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-800/80 bg-red-900/40 text-red-400">
              <AlertCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Failed to load campaigns</h3>
            <p className="mb-6 max-w-md text-sm text-neutral-400">
              {error || 'Unable to connect to the network. Please verify your connection and try again.'}
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={loadCampaigns}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : isPageLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CampaignCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          hasActiveFilters ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-800/80 text-indigo-400">
                <SearchX className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">No campaigns match your search</h3>
              <p className="mb-6 max-w-md text-sm text-neutral-400">
                Try adjusting your search terms or clearing your filters to explore other projects.
              </p>
              <Button variant="secondary" size="md" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <CampaignGrid campaigns={items} chains={chains} isLoading={false} />
        )}
      </main>
    </div>
  );
}
