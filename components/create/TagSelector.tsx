'use client';

/**
 * TagSelector.tsx
 * Shows every tag from CAMPAIGN_TAGS as a clickable pill; toggling a pill adds or
 * removes it from the selection, and once the `max` limit is reached a hint appears
 * to tell the user they cannot pick any more.
 */

import { CAMPAIGN_TAGS } from '@/lib/constants';

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  /** Maximum number of tags allowed (default: 3) */
  max?: number;
}

export default function TagSelector({ selected, onChange, max = 3 }: TagSelectorProps) {
  const atLimit = selected.length >= max;

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      // Always allow de-selecting
      onChange(selected.filter((t) => t !== tag));
    } else if (!atLimit) {
      onChange([...selected, tag]);
    }
    // If at limit and not already selected, do nothing (blocked)
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tag: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(tag);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Pill grid */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Campaign tags">
        {CAMPAIGN_TAGS.map((tag) => {
          const isSelected = selected.includes(tag);
          const isDisabled = atLimit && !isSelected;

          return (
            <button
              key={tag}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => toggle(tag)}
              onKeyDown={(e) => handleKeyDown(e, tag)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
                ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white focus:ring-indigo-500'
                    : isDisabled
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-indigo-500 hover:text-indigo-300 focus:ring-neutral-500'
                }
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Limit hint */}
      {atLimit && (
        <p className="text-xs text-amber-400" aria-live="polite">
          ⚠️ Maximum {max} tags reached. Deselect one to change.
        </p>
      )}

      {/* Selection count */}
      <p className="text-xs text-neutral-500">
        {selected.length} / {max} selected
      </p>
    </div>
  );
}
