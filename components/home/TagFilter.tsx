'use client';

import { CAMPAIGN_TAGS } from '@/lib/constants';

interface TagFilterProps {
  tags?: string[];
  selected: string | null;
  onSelect: (t: string | null) => void;
}

export default function TagFilter({
  tags = CAMPAIGN_TAGS,
  selected,
  onSelect,
}: TagFilterProps) {
  const availableTags = tags && tags.length > 0 ? tags : CAMPAIGN_TAGS;

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 text-sm scrollbar-none"
      role="group"
      aria-label="Filter campaigns by category"
    >
      {/* "All" pill button to clear tag filter */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
          selected === null
            ? 'border border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
            : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200'
        }`}
        aria-pressed={selected === null}
      >
        All
      </button>

      {/* Category tag pills */}
      {availableTags.map((tag) => {
        const isSelected = selected === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onSelect(isSelected ? null : tag)}
            className={`inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
              isSelected
                ? 'border border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
            aria-pressed={isSelected}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
